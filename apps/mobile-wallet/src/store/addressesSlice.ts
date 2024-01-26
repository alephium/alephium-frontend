/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import {
  ADDRESSES_QUERY_LIMIT,
  AddressHash,
  Asset,
  extractNewTransactionHashes,
  getTransactionsOfAddress,
  NFT,
  TokenDisplayBalances
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { addressToGroup, explorer, TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { chunk, sortBy, uniq } from 'lodash'

import {
  fetchAddressesBalances,
  fetchAddressesHistoricalBalances,
  fetchAddressesTokens,
  fetchAddressesTransactions,
  fetchAddressesTransactionsNextPage,
  fetchAddressTransactionsNextPage
} from '~/api/addresses'
import { syncingAddressDataStarted } from '~/store/addresses/addressesActions'
import { balanceHistoryAdapter } from '~/store/addresses/addressesAdapter'
import { appReset } from '~/store/appSlice'
import { selectAllFungibleTokens, selectAllNFTs, selectNFTIds } from '~/store/assets/assetsSelectors'
import { customNetworkSettingsSaved, networkPresetSwitched } from '~/store/networkSlice'
import { RootState } from '~/store/store'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { walletUnlocked } from '~/store/wallet/walletSlice'
import { Address, AddressesHistoricalBalanceResult, AddressPartial } from '~/types/addresses'
import { PendingTransaction } from '~/types/transactions'
import { getRandomLabelColor } from '~/utils/colors'

const sliceName = 'addresses'

const addressesAdapter = createEntityAdapter<Address>({
  selectId: (address) => address.hash,
  sortComparer: (a, b) => {
    // Always keep main address to the top of the list
    if (a.settings.isDefault) return -1
    if (b.settings.isDefault) return 1
    return (b.lastUsed ?? 0) - (a.lastUsed ?? 0)
  }
})

interface AddressesState extends EntityState<Address> {
  loadingBalances: boolean
  loadingTransactions: boolean
  loadingTokens: boolean
  syncingAddressData: boolean
  status: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  loadingBalances: false,
  loadingTransactions: false,
  loadingTokens: false,
  syncingAddressData: false,
  status: 'uninitialized'
})

export const syncAddressesDataWhenPendingTxsConfirm = createAsyncThunk(
  `${sliceName}/syncAddressesDataWhenPendingTxsConfirm`,
  async ({ addresses, pendingTxs }: { addresses: AddressHash[]; pendingTxs: PendingTransaction[] }, { dispatch }) => {
    const results = await fetchAddressesTransactions(addresses)

    for (const { hash, transactions } of results) {
      if (transactions.some((confirmedTx) => pendingTxs.some((pendingTx) => pendingTx.hash === confirmedTx.hash))) {
        await dispatch(syncAddressesData(hash))
        await dispatch(syncAddressesHistoricBalances(hash))
      }
    }
  }
)

export const syncAddressesData = createAsyncThunk(
  `${sliceName}/syncAddressesData`,
  async (payload: AddressHash | AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(syncingAddressDataStarted())

    const state = getState() as RootState
    const addresses =
      payload !== undefined ? (Array.isArray(payload) ? payload : [payload]) : (state.addresses.ids as AddressHash[])

    await dispatch(syncAddressesBalances(addresses))
    await dispatch(syncAddressesTokens(addresses))
    await dispatch(syncAddressesTransactions(addresses))
  }
)

export const syncAddressesBalances = createAsyncThunk(
  `${sliceName}/syncAddressesBalances`,
  async (addresses: AddressHash[]) => await fetchAddressesBalances(addresses)
)

export const syncAddressesTransactions = createAsyncThunk(
  `${sliceName}/syncAddressesTransactions`,
  async (addresses: AddressHash[]) => await fetchAddressesTransactions(addresses)
)

export const syncAddressesTokens = createAsyncThunk(
  `${sliceName}/syncAddressesTokens`,
  async (addresses: AddressHash[]) => await fetchAddressesTokens(addresses)
)

// TODO: Same as in desktop wallet, share state?
export const syncAddressTransactionsNextPage = createAsyncThunk(
  'addresses/syncAddressTransactionsNextPage',
  async (payload: AddressHash, { getState, dispatch }) => {
    dispatch(transactionsLoadingStarted())

    const state = getState() as RootState
    const address = selectAddressByHash(state, payload)

    if (!address) return

    return await fetchAddressTransactionsNextPage(address)
  }
)

// TODO: Same as in desktop wallet, share state?
export const syncAllAddressesTransactionsNextPage = createAsyncThunk(
  'addresses/syncAllAddressesTransactionsNextPage',
  async (
    payload: { minTxs: number } | undefined,
    { getState, dispatch }
  ): Promise<{ pageLoaded: number; transactions: explorer.Transaction[] }> => {
    dispatch(transactionsLoadingStarted())

    const state = getState() as RootState
    const addresses = selectAllAddresses(state)
    const minimumNewTransactionsNeeded = payload?.minTxs ?? 1

    let nextPageToLoad = state.confirmedTransactions.pageLoaded + 1
    let enoughNewTransactionsFound = false
    let newTransactions: explorer.Transaction[] = []

    while (!enoughNewTransactionsFound) {
      const results = await Promise.all(
        chunk(addresses, ADDRESSES_QUERY_LIMIT).map((addressesChunk) =>
          fetchAddressesTransactionsNextPage(addressesChunk, nextPageToLoad)
        )
      )

      const nextPageTransactions = results.flat()

      if (nextPageTransactions.length === 0) break

      newTransactions = newTransactions.concat(
        nextPageTransactions.filter(
          (newTx) =>
            !addresses.some((address) => address.transactions.some((existingTxHash) => existingTxHash === newTx.hash))
        )
      )

      enoughNewTransactionsFound = newTransactions.length >= minimumNewTransactionsNeeded
      nextPageToLoad += 1
    }

    return { pageLoaded: nextPageToLoad - 1, transactions: newTransactions }
  }
)

// TODO: Same as in desktop wallet, share state?
export const syncAddressesHistoricBalances = createAsyncThunk(
  'addresses/syncAddressesHistoricBalances',
  async (payload: AddressHash | AddressHash[] | undefined, { getState }): Promise<AddressesHistoricalBalanceResult> => {
    const state = getState() as RootState

    const addresses =
      payload !== undefined ? (Array.isArray(payload) ? payload : [payload]) : (state.addresses.ids as AddressHash[])
    return await fetchAddressesHistoricalBalances(addresses)
  }
)

const addressesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    addressesImported: (state, action: PayloadAction<AddressPartial[]>) => {
      const addresses = action.payload

      const newDefaultAddress = addresses.find((address) => address.settings?.isDefault)
      if (newDefaultAddress) updateOldDefaultAddress(state)

      addressesAdapter.addMany(state, addresses.map(getInitialAddressState))
    },
    newAddressGenerated: (state, action: PayloadAction<AddressPartial>) => {
      const address = action.payload

      if (address.settings.isDefault) updateOldDefaultAddress(state)

      addressesAdapter.addOne(state, getInitialAddressState(address))
    },
    addressSettingsSaved: (state, action: PayloadAction<AddressPartial>) => {
      const address = action.payload

      if (address.settings.isDefault) updateOldDefaultAddress(state)

      addressesAdapter.updateOne(state, {
        id: address.hash,
        changes: { settings: address.settings }
      })
    },
    transactionSent: (state, action: PayloadAction<PendingTransaction>) => {
      const pendingTransaction = action.payload
      const address = state.entities[pendingTransaction.fromAddress] as Address

      address.transactions.push(pendingTransaction.hash)
    },
    transactionsLoadingStarted: (state) => {
      state.loadingTransactions = true
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncingAddressDataStarted, (state) => {
        state.syncingAddressData = true
        state.loadingBalances = true
        state.loadingTransactions = true
        state.loadingTokens = true
      })
      .addCase(walletUnlocked, (state, action) => {
        const { addressesToInitialize } = action.payload

        if (addressesToInitialize.length > 0) {
          addressesAdapter.setAll(state, [])
          addressesAdapter.addMany(state, addressesToInitialize.map(getInitialAddressState))
          state.status = 'uninitialized'
          state.syncingAddressData = false
          state.loadingBalances = false
          state.loadingTransactions = false
          state.loadingTokens = false
        }
      })
      .addCase(newWalletGenerated, (state, action) => {
        const firstWalletAddress = getInitialAddressState({
          ...action.payload.firstAddress,
          settings: {
            isDefault: true,
            color: getRandomLabelColor()
          }
        })

        addressesAdapter.setAll(state, [])
        addressesAdapter.addOne(state, firstWalletAddress)
      })
      .addCase(syncAddressesData.fulfilled, (state, action) => {
        state.status = 'initialized'
        state.syncingAddressData = false
        state.loadingBalances = false
        state.loadingTransactions = false
        state.loadingTokens = false
      })
      .addCase(syncAddressesTokens.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, tokenBalances }) => ({
          id: hash,
          changes: {
            tokens: tokenBalances
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTokens = false
      })
      .addCase(syncAddressesTransactions.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, transactions, mempoolTransactions }) => {
          const address = state.entities[hash] as Address
          const lastUsed =
            mempoolTransactions.length > 0
              ? mempoolTransactions[0].lastSeen
              : transactions.length > 0
                ? transactions[0].timestamp
                : address.lastUsed

          return {
            id: hash,
            changes: {
              transactions: uniq(address.transactions.concat(transactions.map((tx) => tx.hash))),
              transactionsPageLoaded: address.transactionsPageLoaded === 0 ? 1 : address.transactionsPageLoaded,
              lastUsed
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTransactions = false
      })
      .addCase(syncAddressesBalances.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, balance, lockedBalance }) => ({
          id: hash,
          changes: {
            balance,
            lockedBalance
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingBalances = false
      })
      .addCase(syncAddressesData.rejected, (state) => {
        state.syncingAddressData = false
        state.loadingBalances = false
        state.loadingTransactions = false
        state.loadingTokens = false
      })
      .addCase(syncAddressesBalances.rejected, (state) => {
        state.loadingBalances = false
      })
      .addCase(syncAddressesTransactions.rejected, (state) => {
        state.loadingTransactions = false
      })
      .addCase(syncAddressesTokens.rejected, (state) => {
        state.loadingTokens = false
      })
      .addCase(syncAddressTransactionsNextPage.fulfilled, (state, action) => {
        const addressTransactionsData = action.payload

        if (!addressTransactionsData) return

        const { hash, transactions, page } = addressTransactionsData
        const address = state.entities[hash] as Address
        const newTxHashes = extractNewTransactionHashes(transactions, address.transactions)

        addressesAdapter.updateOne(state, {
          id: hash,
          changes: {
            transactions: address.transactions.concat(newTxHashes),
            transactionsPageLoaded: newTxHashes.length > 0 ? page : address.transactionsPageLoaded,
            allTransactionPagesLoaded: transactions.length === 0
          }
        })

        state.loadingTransactions = false
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, { payload: { transactions } }) => {
        const addresses = getAddresses(state)

        const updatedAddresses = addresses.map((address) => {
          const transactionsOfAddress = getTransactionsOfAddress(transactions, address.hash)
          const newTxHashes = extractNewTransactionHashes(transactionsOfAddress, address.transactions)

          return {
            id: address.hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes),
              allTransactionPagesLoaded: transactions.length === 0
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)

        state.loadingTransactions = false
      })
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
      .addCase(appReset, () => initialState)
      .addCase(syncAddressesHistoricBalances.fulfilled, (state, { payload: data }) => {
        data.forEach(({ address, balances }) => {
          const addressState = state.entities[address]

          if (addressState) {
            balanceHistoryAdapter.upsertMany(addressState.balanceHistory, balances)
            addressState.balanceHistoryInitialized = true
          }
        })
      })
  }
})

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state[sliceName])

// TODO: Same as in desktop wallet
export const makeSelectAddressesAlphAsset = () =>
  createSelector(makeSelectAddresses(), (addresses): Asset => {
    const alphBalances = addresses.reduce(
      (acc, { balance, lockedBalance }) => ({
        balance: acc.balance + BigInt(balance),
        lockedBalance: acc.lockedBalance + BigInt(lockedBalance)
      }),
      { balance: BigInt(0), lockedBalance: BigInt(0) }
    )

    return {
      ...ALPH,
      ...alphBalances,
      verified: true
    }
  })

// TODO: Same as in desktop wallet
export const makeSelectAddressesTokens = () =>
  createSelector(
    [selectAllFungibleTokens, selectAllNFTs, makeSelectAddressesAlphAsset(), makeSelectAddresses()],
    (fungibleTokens, nfts, alphAsset, addresses): Asset[] => {
      const tokens = getAddressesTokenBalances(addresses).reduce((acc, token) => {
        const assetInfo = fungibleTokens.find((t) => t.id === token.id)
        const nftInfo = nfts.find((nft) => nft.id === token.id)

        acc.push({
          id: token.id,
          balance: BigInt(token.balance.toString()),
          lockedBalance: BigInt(token.lockedBalance.toString()),
          name: assetInfo?.name ?? nftInfo?.name,
          symbol: assetInfo?.symbol,
          description: assetInfo?.description ?? nftInfo?.description,
          logoURI: assetInfo?.logoURI ?? nftInfo?.image,
          decimals: assetInfo?.decimals ?? 0,
          verified: assetInfo?.verified
        })

        return acc
      }, [] as Asset[])

      return [
        alphAsset,
        ...sortBy(tokens, [(a) => !a.verified, (a) => a.verified === undefined, (a) => a.name?.toLowerCase(), 'id'])
      ]
    }
  )

// TODO: Same as in desktop wallet
export const makeSelectAddressesKnownFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): Asset[] => tokens.filter((token) => !!token?.symbol))

// TODO: Same as in desktop wallet
export const makeSelectAddressesUnknownTokens = () =>
  createSelector(
    [selectAllFungibleTokens, selectNFTIds, makeSelectAddresses()],
    (fungibleTokens, nftIds, addresses): Asset['id'][] => {
      const tokensWithoutMetadata = getAddressesTokenBalances(addresses).reduce(
        (acc, token) => {
          const hasTokenMetadata = !!fungibleTokens.find((t) => t.id === token.id)
          const hasNFTMetadata = nftIds.includes(token.id)

          if (!hasTokenMetadata && !hasNFTMetadata) {
            acc.push(token.id)
          }

          return acc
        },
        [] as Asset['id'][]
      )

      return tokensWithoutMetadata
    }
  )

// TODO: Same as in desktop wallet
export const makeSelectAddressesCheckedUnknownTokens = () =>
  createSelector(
    [makeSelectAddressesUnknownTokens(), (state: RootState) => state.app.checkedUnknownTokenIds],
    (tokensWithoutMetadata, checkedUnknownTokenIds) =>
      tokensWithoutMetadata.filter((tokenId) => checkedUnknownTokenIds.includes(tokenId))
  )

// TODO: Same as in desktop wallet
export const makeSelectAddressesNFTs = () =>
  createSelector([selectAllNFTs, makeSelectAddresses()], (nfts, addresses): NFT[] => {
    const addressesTokenIds = addresses.flatMap(({ tokens }) => tokens.map(({ tokenId }) => tokenId))

    return nfts.filter((nft) => addressesTokenIds.includes(nft.id))
  })

// TODO: Same as in desktop wallet
export const makeSelectAddresses = () =>
  createSelector(
    [selectAllAddresses, (_, addressHashes?: AddressHash[] | AddressHash) => addressHashes],
    (allAddresses, addressHashes) =>
      addressHashes
        ? allAddresses.filter((address) =>
            Array.isArray(addressHashes) ? addressHashes.includes(address.hash) : addressHashes === address.hash
          )
        : allAddresses
  )

export const selectDefaultAddress = createSelector(selectAllAddresses, (addresses) =>
  addresses.find((address) => address.settings.isDefault)
)

export const selectTotalBalance = createSelector([selectAllAddresses], (addresses) =>
  addresses.reduce((acc, address) => acc + BigInt(address.balance), BigInt(0))
)

export const {
  newAddressGenerated,
  addressesImported,
  addressSettingsSaved,
  transactionSent,
  transactionsLoadingStarted
} = addressesSlice.actions

export default addressesSlice

const getInitialAddressState = (addressData: AddressPartial): Address => ({
  ...addressData,
  settings: addressData.settings || {
    isDefault: false,
    color: getRandomLabelColor()
  },
  group: addressToGroup(addressData.hash, TOTAL_NUMBER_OF_GROUPS),
  transactions: [],
  transactionsPageLoaded: 0,
  allTransactionPagesLoaded: false,
  balance: '0',
  lockedBalance: '0',
  lastUsed: 0,
  tokens: [],
  balanceHistory: balanceHistoryAdapter.getInitialState(),
  balanceHistoryInitialized: false
})

const getAddresses = (state: AddressesState) => Object.values(state.entities) as Address[]

const updateOldDefaultAddress = (state: AddressesState) => {
  const oldDefaultAddress = getAddresses(state).find((address) => address.settings.isDefault)

  if (oldDefaultAddress) {
    addressesAdapter.updateOne(state, {
      id: oldDefaultAddress.hash,
      changes: { settings: { ...oldDefaultAddress.settings, isDefault: false } }
    })
  }
}

const clearAddressesNetworkData = (state: AddressesState) => {
  const reinitializedAddresses = getAddresses(state).map(getInitialAddressState)

  addressesAdapter.updateMany(
    state,
    reinitializedAddresses.map((address) => ({ id: address.hash, changes: address }))
  )

  state.status = 'uninitialized'
}

// TODO: Same as in desktop wallet
const getAddressesTokenBalances = (addresses: Address[]) =>
  addresses.reduce((acc, { tokens }) => {
    tokens.forEach((token) => {
      const existingToken = acc.find((t) => t.id === token.tokenId)

      if (!existingToken) {
        acc.push({
          id: token.tokenId,
          balance: BigInt(token.balance),
          lockedBalance: BigInt(token.lockedBalance)
        })
      } else {
        existingToken.balance = existingToken.balance + BigInt(token.balance)
        existingToken.lockedBalance = existingToken.lockedBalance + BigInt(token.lockedBalance)
      }
    })

    return acc
  }, [] as TokenDisplayBalances[])
