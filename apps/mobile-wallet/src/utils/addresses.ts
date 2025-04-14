import { Address, AddressHash, AddressMetadataWithHash, AddressSettings } from '@alephium/shared'
import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import * as Clipboard from 'expo-clipboard'

import i18n from '~/features/localization/i18n'
import { persistAddressesMetadata } from '~/persistent-storage/wallet'
import { AddressDiscoveryGroupData } from '~/types/addresses'
import { getRandomLabelColor } from '~/utils/colors'
import { showToast, ToastDuration } from '~/utils/layout'

export const copyAddressToClipboard = async (addressHash: AddressHash) => {
  try {
    await Clipboard.setStringAsync(addressHash)
    showToast({ text1: i18n.t('Address copied!'), visibilityTime: ToastDuration.SHORT })
  } catch (error) {
    console.log(error)
    showToast({ text1: i18n.t('Error while copying address'), visibilityTime: ToastDuration.SHORT, type: 'error' })
  }
}

export const findNextAvailableAddressIndex = (startIndex: number, skipIndexes: number[] = []) => {
  let nextAvailableAddressIndex = startIndex

  do {
    nextAvailableAddressIndex++
  } while (skipIndexes.includes(nextAvailableAddressIndex))

  return nextAvailableAddressIndex
}

export const findMaxIndexBeforeFirstGap = (indexes: number[]) => {
  let maxIndexBeforeFirstGap = indexes[0]

  for (let index = indexes[1]; index < indexes.length; index++) {
    if (index - maxIndexBeforeFirstGap > 1) {
      break
    } else {
      maxIndexBeforeFirstGap = index
    }
  }

  return maxIndexBeforeFirstGap
}

export const persistAddressesSettings = async (
  addressesMetadata: AddressMetadataWithHash[],
  metadataId: string,
  oldDefaultAddress?: Address
) => {
  await persistAddressesMetadata(metadataId, addressesMetadata)

  const newDefaultAddress = addressesMetadata.find((address) => address.isDefault)
  if (newDefaultAddress && oldDefaultAddress && oldDefaultAddress.hash !== newDefaultAddress.hash) {
    const updatedOldDefaultAddress = {
      ...oldDefaultAddress,
      isDefault: false
    }
    await persistAddressesMetadata(metadataId, [updatedOldDefaultAddress])
  }
}

export const initializeAddressDiscoveryGroupsData = (addresses: Address[]): AddressDiscoveryGroupData[] => {
  const groupsData: AddressDiscoveryGroupData[] = Array.from({ length: TOTAL_NUMBER_OF_GROUPS }, () => ({
    highestIndex: undefined,
    gap: 0
  }))

  for (const address of addresses) {
    const groupData = groupsData[address.group]

    if (groupData.highestIndex === undefined || groupData.highestIndex < address.index) {
      groupData.highestIndex = address.index
    }
  }

  return groupsData
}

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})
