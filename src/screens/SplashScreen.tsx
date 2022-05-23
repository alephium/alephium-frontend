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

import { StackScreenProps } from '@react-navigation/stack'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Screen from '../components/layout/Screen'
import { useAppDispatch } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { AlephiumLogoStyled, GradientBackgroundStyled } from '../screens/LandingScreen'
import { getActiveWallet } from '../storage/wallets'
import { walletChanged } from '../store/activeWalletSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'SplashScreen'>

const SplashScreen = ({ navigation }: { style: StyleProp<ViewStyle> } & ScreenProps) => {
  const { yellow, orange, red, purple, cyan } = useTheme().gradient
  const dispatch = useAppDispatch()

  useEffect(() => {
    const getWalletFromStorageAndNavigate = async () => {
      try {
        const activeWallet = await getActiveWallet()
        if (activeWallet === null) {
          navigation.navigate('LandingScreen')
        } else if (activeWallet.authType === 'pin') {
          navigation.navigate('LoginScreen', { activeWallet })
        } else if (activeWallet.authType === 'biometrics') {
          dispatch(walletChanged(activeWallet))
          navigation.navigate('DashboardScreen')
        } else {
          throw new Error('Unknown auth type')
        }
      } catch (e) {
        console.error(e)
        // TODO: Handle following 2 cases:
        // 1. User cancels biometric authentication even though the fetched wallet is stored with biometrics auth
        // required. Show a message something like "You have to authenticate with your biometrics to access this wallet"
        // 2. User had previously stored their wallet with biometrics auth, but in the meantime they removed their
        // biometrics setup from their device. Show a message something like "This wallet is only accessibly via
        // biometrics authentication, please set up biometrics on your device settings and try again."
      }
    }

    setTimeout(() => {
      getWalletFromStorageAndNavigate()
    }, 1000)
  }, [dispatch, navigation])

  console.log('SplashScreen renders')

  return (
    <Screen>
      <LogoContainer>
        <AlephiumLogoStyled />
      </LogoContainer>
      <GradientBackgroundStyled
        from={{ scale: 1 }}
        animate={{ scale: 2 }}
        transition={{
          loop: true,
          type: 'timing',
          duration: 2000
        }}
      >
        <LinearGradient colors={[yellow, orange, red, purple, cyan]} style={{ width: '100%', height: '100%' }} />
      </GradientBackgroundStyled>
    </Screen>
  )
}

export default styled(SplashScreen)`
  flex: 1;
`

const LogoContainer = styled(View)`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
