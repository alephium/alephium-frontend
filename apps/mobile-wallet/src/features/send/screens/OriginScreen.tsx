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

import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import AddressFlashListScreen from '~/components/AddressFlashListScreen'
import Button from '~/components/buttons/Button'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'OriginScreen'>, ScrollScreenProps {}

const OriginScreen = ({ navigation, route: { params } }: ScreenProps) => {
  const { fromAddress, setFromAddress, setToAddress } = useSendContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const { screenScrollHandler } = useHeaderContext()
  const { t } = useTranslation()

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  useFocusEffect(
    useCallback(() => {
      if (!fromAddress && defaultAddress) setFromAddress(defaultAddress.hash)
    }, [defaultAddress, fromAddress, setFromAddress])
  )

  return (
    <AddressFlashListScreen
      onAddressPress={setFromAddress}
      selectedAddress={fromAddress}
      headerTitleAlwaysVisible
      screenTitle={t('Origin')}
      screenIntro={t('Select the address from which to send the transaction.')}
      contentPaddingTop
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button title={t('Continue')} variant="highlight" onPress={() => navigation.navigate('AssetsScreen')} />
      )}
    />
  )
}

export default OriginScreen
