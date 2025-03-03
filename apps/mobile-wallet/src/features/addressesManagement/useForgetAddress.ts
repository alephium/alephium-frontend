import { AddressHash, getHumanReadableError } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import { useAppDispatch } from '~/hooks/redux'
import { deleteAddress } from '~/persistent-storage/wallet'
import { addressDeleted } from '~/store/addresses/addressesActions'
import { showToast } from '~/utils/layout'

interface UseForgetAddressProps {
  addressHash: AddressHash
  origin: 'quickActions' | 'addressSettings'
  onConfirm?: () => void
}

const useForgetAddress = ({ addressHash, onConfirm, origin }: UseForgetAddressProps) => {
  const canDeleteAddress = useCanDeleteAddress(addressHash)
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const forgetAddress = async () => {
    if (!canDeleteAddress) return null

    Alert.alert(t('forgetAddress_one'), t('You can always re-add it to your wallet.'), [
      {
        text: t('Cancel'),
        style: 'cancel'
      },
      {
        text: t('Forget'),
        style: 'destructive',
        onPress: async () => {
          onConfirm?.()

          try {
            await deleteAddress(addressHash)
            dispatch(addressDeleted(addressHash))
            showToast({
              type: 'info',
              text1: t('Address forgotten')
            })
          } catch (error) {
            const message = t('Could not forget address')
            sendAnalytics({ type: 'error', message, error })
            showToast({
              type: 'error',
              text1: t('Could not forget address'),
              text2: getHumanReadableError(error, '')
            })
          }

          sendAnalytics({ event: 'Deleted address', props: { origin } })
        }
      }
    ])
  }

  return forgetAddress
}

export default useForgetAddress
