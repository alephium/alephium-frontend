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
  AddressFungibleToken,
  AddressHash,
  appReset,
  Asset,
  balanceHistoryAdapter,
  calculateAssetsData,
  client,
  customNetworkSettingsSaved,
  extractNewTransactions,
  getTransactionsOfAddress,
  networkPresetSwitched,
  NFT,
  selectAllFungibleTokens,
  selectAllNFTs,
  selectAllPrices,
  selectAllPricesHistories,
  selectNFTIds,
  sortAssets,
  TokenDisplayBalances
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer, groupOfAddress } from '@alephium/web3'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  EntityState,
  PayloadAction
} from '@reduxjs/toolkit'
import { chunk } from 'lodash'

import { fetchAddressesBalances, fetchAddressesTokens, fetchAddressesTransactionsNextPage } from '~/api/addresses'
import { RootState } from '~/store/store'
import { newWalletGenerated, walletDeleted, walletUnlocked } from '~/store/wallet/walletActions'
import { Address, AddressPartial } from '~/types/addresses'
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
  status: 'uninitialized' | 'initialized'
  balancesStatus: 'uninitialized' | 'initialized'
}

const initialState: AddressesState = addressesAdapter.getInitialState({
  status: 'uninitialized',
  balancesStatus: 'uninitialized'
})

export const syncLatestTransactions = createAsyncThunk(
  'addresses/syncLatestTransactions',
  async (payload: AddressHash | AddressHash[] | undefined, { getState, dispatch }) => {
    console.log('Checking for new transactions')

    const state = getState() as RootState
    const addresses =
      payload !== undefined ? (Array.isArray(payload) ? payload : [payload]) : (state.addresses.ids as AddressHash[])

    const results = await Promise.all(
      chunk(addresses, ADDRESSES_QUERY_LIMIT).map((addressesChunk) =>
        client.explorer.addresses.postAddressesTransactions({ page: 1 }, addressesChunk)
      )
    )

    const latestTransactions = results.flat()

    const newTransactionsResults = addresses.reduce(
      (acc, addressHash) => {
        const transactionsOfAddress = getTransactionsOfAddress(latestTransactions, addressHash)
        const address = selectAddressByHash(state, addressHash)

        if (!address) return acc

        const newTransactions = extractNewTransactions(transactionsOfAddress, address.transactions)

        if (newTransactions.length > 0)
          acc.push({
            hash: address.hash,
            newTransactions
          })

        return acc
      },
      [] as {
        hash: AddressHash
        newTransactions: Transaction[]
      }[]
    )

    const addressesWithNewTransactions = newTransactionsResults.map(({ hash }) => hash)
    const addressesToFetchData =
      state.addresses.status === 'uninitialized' ? (state.addresses.ids as AddressHash[]) : addressesWithNewTransactions

    if (addressesToFetchData.length > 0) {
      await Promise.all([
        dispatch(syncAddressesBalances(addressesToFetchData)),
        dispatch(syncAddressesTokens(addressesToFetchData))
      ])
    }

    return newTransactionsResults
  }
)

export const syncAddressesBalances = createAsyncThunk(
  `${sliceName}/syncAddressesBalances`,
  async (addresses: AddressHash[]) => await fetchAddressesBalances(addresses)
)

export const syncAddressesTokens = createAsyncThunk(
  `${sliceName}/syncAddressesTokens`,
  async (addresses: AddressHash[]) => await fetchAddressesTokens(addresses)
)

// Same as in desktop wallet, share state?
export const syncAllAddressesTransactionsNextPage = createAsyncThunk(
  'addresses/syncAllAddressesTransactionsNextPage',
  async (
    payload: { minTxs: number } | undefined,
    { getState }
  ): Promise<{ pageLoaded: number; transactions: explorer.Transaction[] }> => {
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
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(walletUnlocked, (state, { payload: { addresses } }) => {
        const addressesToInitialize = addresses.filter((address) => !state.entities[address.hash])

        if (addressesToInitialize.length > 0) {
          addressesAdapter.addMany(
            state,
            addressesToInitialize.map(({ index, hash, ...settings }) =>
              getInitialAddressState({
                index,
                hash,
                settings
              })
            )
          )
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
      .addCase(syncAddressesTokens.fulfilled, (state, action) => {
        const addressData = action.payload
        const updatedAddresses = addressData.map(({ hash, tokenBalances }) => ({
          id: hash,
          changes: {
            tokens: tokenBalances
          }
        }))

        addressesAdapter.updateMany(state, updatedAddresses)
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
        state.balancesStatus = 'initialized'
      })
      .addCase(syncLatestTransactions.fulfilled, (state, { payload }) => {
        const changes = payload.map(({ hash, newTransactions }) => {
          const existingData = state.entities[hash]

          return {
            id: hash,
            changes: {
              transactions: existingData?.transactions?.concat(newTransactions.map(({ hash }) => hash)),
              lastUsed: newTransactions[0]?.timestamp ?? existingData?.lastUsed
            }
          }
        })

        if (changes.length > 0) addressesAdapter.updateMany(state, changes)

        state.status = 'initialized'
      })
      .addCase(syncAllAddressesTransactionsNextPage.fulfilled, (state, { payload: { transactions } }) => {
        const addresses = getAddresses(state)

        const updatedAddresses = addresses.map((address) => {
          const transactionsOfAddress = getTransactionsOfAddress(transactions, address.hash)
          const newTxHashes = extractNewTransactions(transactionsOfAddress, address.transactions).map(
            ({ hash }) => hash
          )

          return {
            id: address.hash,
            changes: {
              transactions: address.transactions.concat(newTxHashes),
              allTransactionPagesLoaded: transactions.length === 0
            }
          }
        })

        addressesAdapter.updateMany(state, updatedAddresses)
      })
      .addCase(networkPresetSwitched, clearAddressesNetworkData)
      .addCase(customNetworkSettingsSaved, clearAddressesNetworkData)
      .addCase(appReset, () => initialState)
      .addCase(walletDeleted, () => initialState)
  }
})

export const {
  selectById: selectAddressByHash,
  selectAll: selectAllAddresses,
  selectIds: selectAddressIds
} = addressesAdapter.getSelectors<RootState>((state) => state[sliceName])

// Same as in desktop wallet
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

// Same as in desktop wallet
export const makeSelectAddressesTokens = () =>
  createSelector(
    [selectAllFungibleTokens, selectAllNFTs, makeSelectAddressesAlphAsset(), makeSelectAddresses(), selectAllPrices],
    (fungibleTokens, nfts, alphAsset, addresses, tokenPrices): Asset[] => {
      const tokenBalances = getAddressesTokenBalances(addresses)
      const tokens = calculateAssetsData([alphAsset, ...tokenBalances], fungibleTokens, nfts, tokenPrices)

      return sortAssets(tokens)
    }
  )

// Same as in desktop wallet
export const makeSelectAddressesKnownFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): AddressFungibleToken[] =>
    tokens.filter((token): token is AddressFungibleToken => !!token.symbol)
  )

// Same as in desktop wallet
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

// Same as in desktop wallet
export const makeSelectAddressesCheckedUnknownTokens = () =>
  createSelector(
    [makeSelectAddressesUnknownTokens(), (state: RootState) => state.app.checkedUnknownTokenIds],
    (tokensWithoutMetadata, checkedUnknownTokenIds) =>
      tokensWithoutMetadata.filter((tokenId) => checkedUnknownTokenIds.includes(tokenId))
  )

// Same as in desktop wallet
export const makeSelectAddressesNFTs = () =>
  createSelector([selectAllNFTs, makeSelectAddresses()], (nfts, addresses): NFT[] => {
    const addressesTokenIds = addresses.flatMap(({ tokens }) => tokens.map(({ tokenId }) => tokenId))

    return nfts.filter((nft) => addressesTokenIds.includes(nft.id))
  })

// Same as in desktop wallet
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

export const { newAddressGenerated, addressesImported, addressSettingsSaved } = addressesSlice.actions

export default addressesSlice

const getInitialAddressState = (addressData: AddressPartial): Address => ({
  ...addressData,
  settings: addressData.settings || {
    isDefault: false,
    color: getRandomLabelColor()
  },
  group: groupOfAddress(addressData.hash),
  transactions: [],
  allTransactionPagesLoaded: false,
  balance: '0',
  lockedBalance: '0',
  lastUsed: 0,
  tokens: [],
  balanceHistory: balanceHistoryAdapter.getInitialState()
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

// Same as in desktop wallet
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

export const makeSelectAddressesVerifiedFungibleTokens = () =>
  createSelector([makeSelectAddressesTokens()], (tokens): AddressFungibleToken[] =>
    tokens.filter((token): token is AddressFungibleToken => !!token.verified)
  )

export const selectAllAddressVerifiedFungibleTokenSymbols = createSelector(
  [makeSelectAddressesVerifiedFungibleTokens(), selectAllPricesHistories],
  (verifiedFungibleTokens, histories) =>
    verifiedFungibleTokens
      .map((token) => token.symbol)
      .reduce(
        (acc, tokenSymbol) => {
          const tokenHistory = histories.find(({ symbol }) => symbol === tokenSymbol)

          if (!tokenHistory || tokenHistory.status === 'uninitialized') {
            acc.uninitialized.push(tokenSymbol)
          } else if (tokenHistory && tokenHistory.history.length > 0) {
            acc.withPriceHistory.push(tokenSymbol)
          }

          return acc
        },
        {
          uninitialized: [] as string[],
          withPriceHistory: [] as string[]
        }
      )
)
