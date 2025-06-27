import { Address, AddressHash, AddressSettings, AddressStoredMetadataWithHash } from '@alephium/shared'
import * as Clipboard from 'expo-clipboard'

import i18n from '~/features/localization/i18n'
import { persistAddressesMetadata } from '~/persistent-storage/wallet'
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

export const findMaxIndexBeforeFirstGap = (indexes: number[]) => {
  if (indexes.length === 0) return undefined
  if (indexes.length === 1) return indexes[0]

  let maxIndexBeforeFirstGap = indexes[0]

  for (let i = 1; i < indexes.length; i++) {
    if (indexes[i] - maxIndexBeforeFirstGap > 1) {
      break
    } else {
      maxIndexBeforeFirstGap = indexes[i]
    }
  }

  return maxIndexBeforeFirstGap
}

export const persistAddressesSettings = async (
  addressesMetadata: AddressStoredMetadataWithHash[],
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

export const getInitialAddressSettings = (): AddressSettings => ({
  isDefault: true,
  color: getRandomLabelColor()
})
