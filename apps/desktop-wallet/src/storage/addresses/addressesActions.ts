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
  AddressSettings,
  BalanceHistory,
  CHART_DATE_FORMAT,
  client,
  Contact,
  getHumanReadableError,
  syncingAddressDataStarted
} from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { chunk } from 'lodash'

import {
  fetchAddressesBalances,
  fetchAddressesTokensBalances,
  fetchAddressesTransactions,
  fetchAddressesTransactionsNextPage,
  fetchAddressTransactionsNextPage
} from '@/api/addresses'
import i18n from '@/i18n'
import { selectAddressByHash, selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { RootState } from '@/storage/store'
import { Address, AddressBase, LoadingEnabled } from '@/types/addresses'
import { Message } from '@/types/snackbar'

export const transactionsLoadingStarted = createAction('addresses/transactionsLoadingStarted')

export const addressesRestoredFromMetadata = createAction<AddressBase[]>('addresses/addressesRestoredFromMetadata')

export const addressRestorationStarted = createAction('addresses/addressRestorationStarted')

export const newAddressesSaved = createAction<AddressBase[]>('addresses/newAddressesSaved')

export const defaultAddressChanged = createAction<Address>('addresses/defaultAddressChanged')

export const addressDiscoveryStarted = createAction<LoadingEnabled>('addresses/addressDiscoveryStarted')

export const addressDiscoveryFinished = createAction<LoadingEnabled>('addresses/addressDiscoveryFinished')

export const addressSettingsSaved = createAction<{ addressHash: AddressHash; settings: AddressSettings }>(
  'addresses/addressSettingsSaved'
)

export const syncAddressesData = createAsyncThunk(
  'addresses/syncAddressesData',
  async (payload: AddressHash[] | undefined, { getState, dispatch }) => {
    dispatch(syncingAddressDataStarted())

    const state = getState() as RootState
    const addresses = payload ?? (state.addresses.ids as AddressHash[])

    try {
      await dispatch(syncAddressesBalances(addresses))
      await dispatch(syncAddressesTokensBalances(addresses))
      await dispatch(syncAddressesTransactions(addresses))
    } catch (e) {
      throw getHumanReadableError(e, i18n.t("Encountered error while syncing your addresses' data."))
    }
  }
)

export const syncAddressesBalances = createAsyncThunk(
  'addresses/syncAddressesBalances',
  async (addresses: AddressHash[]) => await fetchAddressesBalances(addresses)
)

export const syncAddressesTransactions = createAsyncThunk(
  'addresses/syncAddressesTransactions',
  async (addresses: AddressHash[]) => await fetchAddressesTransactions(addresses)
)

export const syncAddressesTokensBalances = createAsyncThunk(
  'addresses/syncAddressesTokensBalances',
  async (addresses: AddressHash[]) => await fetchAddressesTokensBalances(addresses)
)

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

export const syncAddressesAlphHistoricBalances = createAsyncThunk(
  'addresses/syncAddressesAlphHistoricBalances',
  async (
    payload: AddressHash[] | undefined,
    { getState }
  ): Promise<
    {
      address: AddressHash
      balances: BalanceHistory[]
    }[]
  > => {
    const now = dayjs()
    const thisMoment = now.valueOf()
    const oneYearAgo = now.subtract(365, 'days').valueOf()

    const addressesBalances = []
    const state = getState() as RootState

    const addresses = payload ?? (state.addresses.ids as AddressHash[])

    for (const addressHash of addresses) {
      const balances = []

      const { amountHistory } = await client.explorer.addresses.getAddressesAddressAmountHistory(addressHash, {
        fromTs: oneYearAgo,
        toTs: thisMoment,
        'interval-type': explorer.IntervalType.Daily
      })

      if (!amountHistory) return []

      try {
        for (const [timestamp, amount] of amountHistory) {
          balances.push({
            date: dayjs(timestamp).format(CHART_DATE_FORMAT),
            balance: amount
          })
        }
      } catch (e) {
        console.error('Could not parse amount history data', e)
      }

      addressesBalances.push({
        address: addressHash,
        balances
      })
    }

    return addressesBalances
  }
)

export const contactsLoadedFromPersistentStorage = createAction<Contact[]>(
  'contacts/contactsLoadedFromPersistentStorage'
)

export const contactStorageFailed = createAction<Message>('contacts/contactStorageFailed')

export const contactDeletionFailed = createAction<Message>('contacts/contactDeletionFailed')
