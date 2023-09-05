/*
Copyright 2018 - 2022 The Alephium Authors
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

import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import BaseScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { useSendContext } from '~/contexts/SendContext'
import useCustomNavigationHeader from '~/hooks/layout/useCustomNavigationHeader'
import { useAppSelector } from '~/hooks/redux'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import ProgressHeader, { BackButton, ContinueButton } from '~/screens/SendReceive/ProgressHeader'
import ScreenIntro from '~/screens/SendReceive/ScreenIntro'
import { selectAllAddresses, selectDefaultAddress } from '~/store/addressesSlice'

interface ScreenProps extends StackScreenProps<SendNavigationParamList, 'OriginScreen'>, ScrollScreenProps {}

// TODO: Should be converted to a FlatList

const OriginScreen = ({ navigation, route: { params }, ...props }: ScreenProps) => {
  const { fromAddress, setFromAddress, setToAddress } = useSendContext()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)

  useEffect(() => {
    if (params?.toAddressHash) setToAddress(params.toAddressHash)
  }, [params?.toAddressHash, setToAddress])

  useCustomNavigationHeader({
    Header: (props) => (
      <ProgressHeader
        key="progress-header"
        workflow="send"
        {...props}
        HeaderRight={
          <Button
            onPress={() => navigation.navigate('AssetsScreen')}
            iconProps={{ name: 'arrow-forward-outline' }}
            round
          />
        }
      />
    ),
    navigation,
    setInParent: true
  })

  return (
    <BaseScrollScreen {...props}>
      <ScreenIntro title="Origin" subtitle="Select the address from which to send the transaction." surtitle="SEND" />
      <ScreenSection>
        <AddressList>
          {addresses.map((address) => (
            <AddressBox
              key={address.hash}
              addressHash={address.hash}
              isSelected={address.hash === fromAddress}
              onPress={() => setFromAddress(address.hash)}
            />
          ))}
        </AddressList>
      </ScreenSection>
    </BaseScrollScreen>
  )
}

export default OriginScreen

const AddressList = styled.View`
  gap: 20px;
`
