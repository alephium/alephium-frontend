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

import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { AddressMetadata } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { discoverAndCacheActiveAddresses } from '@/api/addresses'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useIsLedger } from '@/features/ledger/useIsLedger'
import { LedgerAlephium } from '@/features/ledger/utils'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import {
  addressDiscoveryFinished,
  addressDiscoveryStarted,
  addressesRestoredFromMetadata,
  addressRestorationStarted
} from '@/storage/addresses/addressesActions'
import { selectAllAddresses } from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
import { showToast } from '@/storage/global/globalActions'
import { AddressBase } from '@/types/addresses'
import { StoredEncryptedWallet } from '@/types/wallet'
import { getInitialAddressSettings } from '@/utils/addresses'
import { getRandomLabelColor } from '@/utils/colors'

interface GenerateAddressProps {
  group?: number
}

interface DiscoverUsedAddressesProps {
  walletId?: string
  skipIndexes?: number[]
  enableLoading?: boolean
}

interface GenerateOneAddressPerGroupProps {
  labelPrefix?: string
  labelColor?: string
  skipGroups?: number[]
}

const useAddressGeneration = () => {
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const { sendAnalytics } = useAnalytics()
  const isLedger = useIsLedger()
  const { t } = useTranslation()

  const currentAddressIndexes = useMemo(() => addresses.map(({ index }) => index), [addresses])

  const generateAddress = useCallback(
    async (group?: GenerateAddressProps['group']): Promise<NonSensitiveAddressData | null> =>
      isLedger
        ? LedgerAlephium.create()
            .catch((error) => {
              console.error(error)
              dispatch(
                showToast({ text: `${t('Could not connect to Alephium Ledger app')}`, type: 'alert', duration: 'long' })
              )
            })
            .then((app) => (app ? app.generateAddress({ group, skipAddressIndexes: currentAddressIndexes }) : null))
        : keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes }),
    [currentAddressIndexes, dispatch, isLedger, t]
  )

  const generateAndSaveOneAddressPerGroup = async (
    { labelPrefix, labelColor, skipGroups = [] }: GenerateOneAddressPerGroupProps = { skipGroups: [] }
  ) => {
    const groups = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, (_, group) => group).filter(
      (group) => !skipGroups.includes(group)
    )
    const randomLabelColor = getRandomLabelColor()

    try {
      for (const group of groups) {
        const address = await generateAddress(group)
        if (!address) continue

        addresses.push({
          ...address,
          group,
          isDefault: false,
          label: labelPrefix ? `${labelPrefix} ${group}` : '',
          color: labelColor ?? randomLabelColor
        })
      }

      try {
        saveNewAddresses(addresses)
      } catch (error) {
        sendAnalytics({ type: 'error', message: 'Could not save new addresses' })
        dispatch(
          showToast({ text: `${t('could_not_save_new_address_other')}: ${error}`, type: 'alert', duration: 'long' })
        )
      }
    } catch (error) {
      const message = 'Could not generate one address per group'
      sendAnalytics({ type: 'error', message })
      dispatch(showToast({ text: `${t(message)}: ${error}`, type: 'alert', duration: 'long' }))
    }
  }

  const restoreAddressesFromMetadata = async (walletId: StoredEncryptedWallet['id'], isPassphraseUsed: boolean) => {
    if (isPassphraseUsed) return

    const addressesMetadata: AddressMetadata[] = addressMetadataStorage.load(walletId)

    // When no metadata found (ie, upgrading from a version older then v1.2.0) initialize with default address
    if (addressesMetadata.length === 0) {
      const initialAddressSettings = getInitialAddressSettings()
      addressMetadataStorage.storeOne(walletId, { index: 0, settings: initialAddressSettings })
      addressesMetadata.push({ index: 0, ...initialAddressSettings })
    }

    dispatch(addressRestorationStarted())

    try {
      const addresses = addressesMetadata.map((metadata) => ({
        ...keyring.generateAndCacheAddress({ addressIndex: metadata.index }),
        ...metadata
      })) as AddressBase[]

      // Fix corrupted data if there is no default address in stored address metadata by making first address default
      if (!addresses.some((address) => address.isDefault)) {
        addresses[0].isDefault = true
        addressMetadataStorage.storeOne(walletId, {
          index: addresses[0].index,
          settings: {
            isDefault: true,
            label: addresses[0].label,
            color: addresses[0].color
          }
        })
      }

      dispatch(addressesRestoredFromMetadata(addresses))
    } catch {
      sendAnalytics({ type: 'error', message: 'Could not generate addresses from metadata' })
    }
  }

  const discoverAndSaveUsedAddresses = async ({
    skipIndexes,
    enableLoading = true
  }: DiscoverUsedAddressesProps = {}) => {
    dispatch(addressDiscoveryStarted(enableLoading))

    try {
      const derivedAddresses = isLedger
        ? await LedgerAlephium.create().then((app) => app.discoverActiveAddresses(skipIndexes))
        : await discoverAndCacheActiveAddresses(skipIndexes)

      const newAddresses = derivedAddresses.map((address) => ({
        ...address,
        isDefault: false,
        color: getRandomLabelColor()
      }))

      try {
        saveNewAddresses(newAddresses)
      } catch {
        sendAnalytics({ type: 'error', message: 'Error while saving newly discovered address' })
      }
      dispatch(addressDiscoveryFinished(enableLoading))
    } catch (error) {
      console.error(error)
      sendAnalytics({ type: 'error', message: 'Could not discover addresses' })
    }
  }

  return {
    generateAddress,
    generateAndSaveOneAddressPerGroup,
    restoreAddressesFromMetadata,
    discoverAndSaveUsedAddresses
  }
}

export default useAddressGeneration
