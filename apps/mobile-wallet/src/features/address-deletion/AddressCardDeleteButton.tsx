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

import { AddressHash, getHumanReadableError } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import useCanDeleteAddress from '~/features/address-deletion/useCanDeleteAddress'
import { useAppDispatch } from '~/hooks/redux'
import { deleteAddress } from '~/persistent-storage/wallet'
import { addressDeleted } from '~/store/addresses/addressesActions'
import { showToast } from '~/utils/layout'

interface AddressCardDeleteButtonProps {
  addressHash: AddressHash
  color: string
}

const AddressCardDeleteButton = ({ addressHash, color }: AddressCardDeleteButtonProps) => {
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

  return <Button iconProps={{ name: 'trash-2' }} color={color} onPress={handleDeletePress} round type="transparent" />
}

export default AddressCardDeleteButton
