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

import AddressFlatListScreen from '~/components/AddressFlatListScreen'
import { BackButton, ContinueButton } from '~/components/buttons/Button'
import ScreenIntro from '~/components/layout/ScreenIntro'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { useSendContext } from '~/contexts/SendContext'
import useScrollToTopOnFocus from '~/hooks/layout/useScrollToTopOnFocus'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'OriginScreen'>, ScrollScreenProps {}

const OriginScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { fromAddress, setFromAddress, setToAddress } = useSendContext()
  const { setHeaderOptions, screenScrollHandler, screenScrollY } = useHeaderContext()
  const defaultAddress = useAppSelector(selectDefaultAddress)

  useScrollToTopOnFocus(screenScrollY)

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  useFocusEffect(
    useCallback(() => {
      if (!fromAddress && defaultAddress) setFromAddress(defaultAddress.hash)
    }, [defaultAddress, fromAddress, setFromAddress])
  )

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />,
        headerRight: () => (
          <ContinueButton onPress={() => navigation.navigate('AssetsScreen')} disabled={!fromAddress} />
        )
      })
    }, [fromAddress, navigation, setHeaderOptions])
  )

  return (
    <AddressFlatListScreen
      onAddressPress={setFromAddress}
      selectedAddress={fromAddress}
      ListHeaderComponent={
        <ScreenIntro title="Origin" subtitle="Select the address from which to send the transaction." />
      }
      contrastedBg
      contentPaddingTop
      onScroll={screenScrollHandler}
    />
  )
}

export default OriginScreen
