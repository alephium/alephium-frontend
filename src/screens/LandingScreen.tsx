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
import { useEffect } from 'react'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useAppDispatch } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'

interface LandingScreenProps extends StackScreenProps<RootStackParamList, 'LandingScreen'>, ScreenProps {}

const LandingScreen = ({ navigation, ...props }: LandingScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  useEffect(() => {
    const routesHistory = navigation.getState().routes.map((route) => route.name)
    const previousRouteName = routesHistory.length > 1 ? routesHistory[routesHistory.length - 2] : undefined

    if (previousRouteName === 'SplashScreen') navigation.setOptions({ headerShown: false })
  }, [navigation])

  return (
    <Screen {...props}>
      <LogoContainer>
        <AlephiumLogoStyled color={theme.bg.contrast} />
      </LogoContainer>
      <TitleContainer>
        <TitleFirstLine>Welcome to the official</TitleFirstLine>
        <TitleSecondLine>Alephium Wallet</TitleSecondLine>
      </TitleContainer>
      <ActionsContainer>
        <ButtonStack>
          <Button title="New wallet" type="primary" variant="contrast" onPress={() => handleButtonPress('create')} />
          <Button title="Import wallet" onPress={() => handleButtonPress('import')} />
        </ButtonStack>
      </ActionsContainer>
    </Screen>
  )
}

export default LandingScreen

const LogoContainer = styled.View`
  flex: 1.5;
  margin-top: 100px;
  justify-content: center;
  align-items: center;
`

export const AlephiumLogoStyled = styled(AlephiumLogo)`
  width: 20%;
  min-width: 40px;
`

const TitleContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const TitleFirstLine = styled(AppText)`
  font-size: 18px;
  color: ${({ theme }) => theme.font.secondary};
`

const TitleSecondLine = styled(AppText)`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.font.primary};
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`
