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

import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { StackHeaderProps } from '@react-navigation/stack'
import { ChevronLeft } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { PressableProps } from 'react-native'
import { Bar as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomModalHeader from '~/components/headers/BottomModalHeader'
import { ScreenSection } from '~/components/layout/Screen'

const sendSteps = ['DestinationScreen', 'OriginScreen', 'AssetsScreen', 'VerifyScreen']

const SendScreenHeader = ({ navigation, route, options, back }: StackHeaderProps) => {
  const theme = useTheme()

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'DestinationScreen'
    const currentStepIndex = sendSteps.findIndex((stepName) => stepName === routeName)

    setProgress(currentStepIndex / sendSteps.length)
  }, [route])

  return (
    <BottomModalHeader>
      <SendScreenHeaderStyled>
        {options.headerLeft ? options.headerLeft({}) : <BackButton onPress={() => navigation.goBack()} />}
        <ProgressBar
          progress={progress}
          color={theme.global.accent}
          unfilledColor={theme.border.secondary}
          borderWidth={0}
          height={9}
          width={120}
        />
        {options.headerRight ? (
          options.headerRight({})
        ) : (
          <ContinueButton onPress={() => navigation.navigate('OriginScreen')} />
        )}
      </SendScreenHeaderStyled>
    </BottomModalHeader>
  )
}

export default SendScreenHeader

export const BackButton = (props: PressableProps) => {
  const theme = useTheme()

  return (
    <BackButtonStyled {...props}>
      <ChevronLeft size={25} color={theme.global.accent} />
    </BackButtonStyled>
  )
}

interface ContinueButtonProps extends PressableProps {
  text?: string
}

export const ContinueButton = ({ text = 'Continue', ...props }: ContinueButtonProps) => (
  <ContinueButtonStyled {...props}>
    <AppText color="contrast" semiBold size={16}>
      {text}
    </AppText>
  </ContinueButtonStyled>
)

const SendScreenHeaderStyled = styled(ScreenSection)`
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 16px;
  align-items: center;
`

export const BackButtonStyled = styled.Pressable`
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: ${({ theme }) => theme.bg.secondary};
  align-items: center;
  justify-content: center;
`

// TODO: Dry
export const ContinueButtonStyled = styled.Pressable`
  padding: 4px 15px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 26px;
  width: 100px;
  align-items: center;
`
