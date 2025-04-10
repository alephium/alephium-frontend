import { AddressHash, extractNewTransactions, getTransactionsOfAddress } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

import { fetchAddressesBalances, fetchAddressesTokens, fetchAddressesTransactionsPage } from '~/api/addresses'
import { selectAddressByHash } from '~/store/addresses/addressesSelectors'
import { RootState } from '~/store/store'

export const addressDeleted = createAction<AddressHash>('addresses/addressDeleted')

export const syncLatestTransactions = createAsyncThunk(
  'addresses/syncLatestTransactions',
  async (
    payload: { addresses: AddressHash | AddressHash[] | 'all'; areAddressesNew: boolean },
    { getState, dispatch }
  ) => {
    const { addresses: _addresses, areAddressesNew } = payload
    const state = getState() as RootState

    const addresses =
      _addresses === 'all'
        ? (state.addresses.ids as AddressHash[])
        : Array.isArray(_addresses)
          ? _addresses
          : [_addresses]

    if (areAddressesNew)
      Promise.all([dispatch(syncAddressesBalances(addresses)), dispatch(syncAddressesTokens(addresses))])

    const latestTransactions = await fetchAddressesTransactionsPage(addresses, 1)

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
        newTransactions: e.Transaction[]
      }[]
    )

    const addressesWithNewTransactions = newTransactionsResults.map(({ hash }) => hash)
    const addressesToFetchData =
      state.addresses.status === 'uninitialized' ? (state.addresses.ids as AddressHash[]) : addressesWithNewTransactions

    if (!areAddressesNew && addressesToFetchData.length > 0)
      Promise.all([
        dispatch(syncAddressesBalances(addressesToFetchData)),
        dispatch(syncAddressesTokens(addressesToFetchData))
      ])

    return newTransactionsResults
  }
)

export const syncAddressesBalances = createAsyncThunk(
  'addresses/syncAddressesBalances',
  async (addresses: AddressHash[]) => await fetchAddressesBalances(addresses)
)

export const syncAddressesTokens = createAsyncThunk(
  'addresses/syncAddressesTokens',
  async (addresses: AddressHash[]) => await fetchAddressesTokens(addresses)
)
