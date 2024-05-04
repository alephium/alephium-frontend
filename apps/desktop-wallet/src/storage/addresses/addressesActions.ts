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

import { AddressHash, AddressSettings, BalanceHistory, CHART_DATE_FORMAT, client, Contact } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import { createAction, createAsyncThunk } from '@reduxjs/toolkit'
import dayjs from 'dayjs'
import { posthog } from 'posthog-js'

import { fetchAddressTransactionsNextPage } from '@/api/addresses'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'
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
    const oneYearAgo = now.subtract(12, 'month').valueOf()

    const addressesBalances = []
    const state = getState() as RootState

    const addresses = payload ?? (state.addresses.ids as AddressHash[])

    for (const addressHash of addresses) {
      const balances = []

      // TODO: Do not use getAddressesAddressAmountHistoryDeprecated when the new delta endpoints are released
      const alphHistoryData = await client.explorer.addresses.getAddressesAddressAmountHistoryDeprecated(
        addressHash,
        { fromTs: oneYearAgo, toTs: thisMoment, 'interval-type': explorer.IntervalType.Daily },
        { format: 'text' }
      )

      try {
        const { amountHistory } = JSON.parse(alphHistoryData)

        for (const [timestamp, balance] of amountHistory) {
          balances.push({
            date: dayjs(timestamp).format(CHART_DATE_FORMAT),
            balance: BigInt(balance).toString()
          })
        }
      } catch (e) {
        console.error('Could not parse amount history data', e)
        posthog.capture('Error', { message: 'Could not parse amount history data' })
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
