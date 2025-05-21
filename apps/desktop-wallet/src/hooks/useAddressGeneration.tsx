import { keyring, NonSensitiveAddressData } from '@alephium/keyring'
import { AddressBase, AddressMetadata } from '@alephium/shared'
import { useUnsortedAddresses } from '@alephium/shared-react'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { discoverAndCacheActiveAddresses } from '@/api/addresses'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { generateLedgerAddressesFromMetadata, LedgerAlephium } from '@/features/ledger/utils'
import { showToast } from '@/features/toastMessages/toastMessagesActions'
import { useAppDispatch } from '@/hooks/redux'
import {
  addressDiscoveryFinished,
  addressDiscoveryStarted,
  addressesRestoredFromMetadata,
  addressRestorationStarted
} from '@/storage/addresses/addressesActions'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { addressMetadataStorage } from '@/storage/addresses/addressMetadataPersistentStorage'
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
  enableToast?: boolean
}

interface GenerateOneAddressPerGroupProps {
  labelPrefix?: string
  labelColor?: string
  skipGroups?: number[]
}

const useAddressGeneration = () => {
  const dispatch = useAppDispatch()
  const addresses = useUnsortedAddresses()
  const { sendAnalytics } = useAnalytics()
  const { isLedger, onLedgerError } = useLedger()
  const { t } = useTranslation()

  const currentAddressIndexes = useMemo(() => addresses.map(({ index }) => index), [addresses])

  const generateAddress = useCallback(
    async (group?: GenerateAddressProps['group']): Promise<NonSensitiveAddressData | null> =>
      isLedger
        ? LedgerAlephium.create()
            .catch(onLedgerError)
            .then((app) =>
              app ? app.generateAddress({ group, skipAddressIndexes: currentAddressIndexes, keyType: 'default' }) : null
            )
        : keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes, keyType: 'default' }),
    [currentAddressIndexes, isLedger, onLedgerError]
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
          showToast({
            text: `${t('could_not_save_new_address_other')}: ${error}`,
            type: 'error',
            duration: 'long'
          })
        )
      }
    } catch (error) {
      const message = 'Could not generate one address per group'
      sendAnalytics({ type: 'error', message })
      dispatch(showToast({ text: `${t(message)}: ${error}`, type: 'error', duration: 'long' }))
    }
  }

  const restoreAddressesFromMetadata = async ({
    walletId,
    isPassphraseUsed,
    isLedger
  }: {
    walletId: StoredEncryptedWallet['id']
    isPassphraseUsed: boolean
    isLedger: boolean
  }) => {
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
      let addresses: AddressBase[] = []

      if (isLedger) {
        addresses = await generateLedgerAddressesFromMetadata({
          addressesMetadata,
          onError: onLedgerError
        })
      } else {
        addresses = addressesMetadata.map((metadata) => ({
          ...keyring.generateAndCacheAddress({ addressIndex: metadata.index, keyType: 'default' }),
          ...metadata
        }))
      }

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
    } catch (error) {
      console.error(error)
      sendAnalytics({ type: 'error', message: 'Could not generate addresses from metadata' })
    }
  }

  const discoverAndSaveUsedAddresses = async ({
    skipIndexes,
    enableLoading = true,
    enableToast = true
  }: DiscoverUsedAddressesProps = {}) => {
    dispatch(addressDiscoveryStarted(enableLoading))

    try {
      const derivedAddresses = isLedger
        ? await LedgerAlephium.create()
            .catch(onLedgerError)
            .then((app) => (app ? app.discoverActiveAddresses(skipIndexes) : []))
        : await discoverAndCacheActiveAddresses(skipIndexes)

      const newAddresses = derivedAddresses.map((address) => ({
        ...address,
        isDefault: false,
        color: getRandomLabelColor()
      }))

      try {
        saveNewAddresses(newAddresses)

        if (enableToast)
          dispatch(
            showToast({
              text: t('Active address discovery completed. Addresses added: {{ count }}', {
                count: newAddresses.length
              }),
              type: 'info',
              duration: 'long'
            })
          )
      } catch {
        sendAnalytics({ type: 'error', message: 'Error while saving newly discovered address' })
      }
    } catch (error) {
      console.error(error)
      sendAnalytics({ type: 'error', message: 'Could not discover addresses' })
    } finally {
      dispatch(addressDiscoveryFinished(enableLoading))
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
