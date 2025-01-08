import { AddressHash, getHumanReadableError } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import useCanDeleteAddress from '~/features/addressesManagement/useCanDeleteAddress'
import { useAppDispatch } from '~/hooks/redux'
import { deleteAddress } from '~/persistent-storage/wallet'
import { addressDeleted } from '~/store/addresses/addressesActions'
import { showToast } from '~/utils/layout'

interface AddressDeleteButtonProps {
  addressHash: AddressHash
  color: string
}

const AddressDeleteButton = ({ addressHash, color }: AddressDeleteButtonProps) => {
  const canDeleteAddress = useCanDeleteAddress(addressHash)
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  if (!canDeleteAddress) return null

  const handleDeletePress = async () => {
    Alert.alert(t('forgetAddress_one'), t('You can always re-add it to your wallet.'), [
      {
        text: t('Cancel'),
        style: 'cancel'
      },
      {
        text: t('Forget'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress(addressHash)
            dispatch(addressDeleted(addressHash))
          } catch (error) {
            const message = t('Could not forget address')
            sendAnalytics({ type: 'error', message, error })
            showToast({
              type: 'error',
              text1: t('Could not forget address'),
              text2: getHumanReadableError(error, '')
            })
          }

          sendAnalytics({ event: 'Deleted address', props: { origin: 'Address card' } })
        }
      }
    ])
  }

  return <Button iconProps={{ name: 'trash-2' }} color={color} onPress={handleDeletePress} squared compact />
}

export default AddressDeleteButton
