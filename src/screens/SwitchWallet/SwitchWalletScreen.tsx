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
import { BlurView } from 'expo-blur'
import { useCallback, useState } from 'react'
import { Alert, BackHandler, Dimensions } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { FlatListScreenProps } from '~/components/layout/FlatListScreen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import RootStackParamList from '~/navigation/rootStackRoutes'
import NewWalletButtons from '~/screens/SwitchWallet/NewWalletButtons'
import SwitchWalletList from '~/screens/SwitchWallet/SwitchWalletList'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { WalletMetadata } from '~/types/wallet'

export interface SwitchWalletScreenProps
  extends StackScreenProps<RootStackParamList, 'SwitchWalletScreen'>,
    Partial<FlatListScreenProps<WalletMetadata>> {}

const SwitchWalletScreen = ({ navigation, route: { params }, ...props }: SwitchWalletScreenProps) => {
  const theme = useTheme()

  const [footerButtonsHeight, setFooterButtonsHeight] = useState(0)

  useFocusEffect(
    useCallback(() => {
      if (params?.disableBack) {
        const subscription = BackHandler.addEventListener('hardwareBackPress', handleBackButton)

        return subscription.remove
      }
    }, [params?.disableBack])
  )

  const handleBackButton = () => {
    Alert.alert('Select a wallet', 'Please, select a wallet to continue')

    return true
  }

  return (
    <>
      <ScrollScreen
        headerOptions={{ headerTitle: 'Wallets' }}
        style={{ paddingBottom: footerButtonsHeight + DEFAULT_MARGIN }}
        verticalGap
      >
        <SwitchWalletList />
      </ScrollScreen>

      <FooterButtonsSection
        tint={theme.name}
        intensity={100}
        top={Dimensions.get('window').height - footerButtonsHeight}
        onLayout={(e) => setFooterButtonsHeight(e.nativeEvent.layout.height)}
      >
        <NewWalletButtons />
      </FooterButtonsSection>
    </>
  )
}

export default SwitchWalletScreen

const FooterButtonsSection = styled(BlurView)<{ top: number }>`
  position: absolute;
  top: ${({ top }) => top}px;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bg.back2};
  padding: ${DEFAULT_MARGIN * 2}px ${DEFAULT_MARGIN}px ${DEFAULT_MARGIN * 3}px;
`
