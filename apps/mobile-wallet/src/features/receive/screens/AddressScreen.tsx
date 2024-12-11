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

import { StackScreenProps } from '@react-navigation/stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import AddressFlashListScreen from '~/components/AddressFlashListScreen'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'AddressScreen'>, ScrollScreenProps {}

const AddressScreen = ({ navigation }: ScreenProps) => {
  const { screenScrollHandler } = useHeaderContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [addressHash, setAddressHash] = useState(defaultAddress.hash)
  const { t } = useTranslation()

  return (
    <AddressFlashListScreen
      onAddressPress={(hash) => setAddressHash(hash)}
      selectedAddress={addressHash}
      screenTitle={t('To address')}
      screenIntro={t('Select the address which you want to receive funds to.')}
      contentPaddingTop
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Continue')}
          variant="highlight"
          disabled={!addressHash}
          onPress={() => navigation.navigate('QRCodeScreen', { addressHash })}
        />
      )}
    />
  )
}

export default AddressScreen
