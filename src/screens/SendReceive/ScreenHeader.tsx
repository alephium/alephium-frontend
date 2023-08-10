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
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

interface ScreenHeaderProps extends StackHeaderProps {
  workflow: 'send' | 'receive'
}

const workflowSteps: Record<
  ScreenHeaderProps['workflow'],
  (keyof ReceiveNavigationParamList)[] | (keyof SendNavigationParamList)[]
> = {
  receive: ['AddressScreen', 'QRCodeScreen'],
  send: ['DestinationScreen', 'OriginScreen', 'AssetsScreen', 'VerifyScreen']
}

const ScreenHeader = ({ navigation, route, options, workflow }: ScreenHeaderProps) => {
  const theme = useTheme()

  const [progress, setProgress] = useState(0)

  const steps = workflowSteps[workflow]

  useEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? steps[0]
    const currentStepIndex = steps.findIndex((step) => step === routeName)

    if (currentStepIndex !== -1) setProgress((currentStepIndex + 1) / steps.length)
  }, [route, steps])

  return (
    <BottomModalHeader>
      <ScreenHeaderStyled>
        {options.headerLeft ? options.headerLeft({}) : <BackButton onPress={() => navigation.goBack()} />}
        <ProgressBar
          progress={progress}
          color={theme.global.accent}
          unfilledColor={theme.border.secondary}
          borderWidth={0}
          height={9}
          width={120}
        />
        {options.headerRight ? options.headerRight({}) : <Hidden />}
      </ScreenHeaderStyled>
    </BottomModalHeader>
  )
}

export default ScreenHeader

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

const ScreenHeaderStyled = styled(ScreenSection)`
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

// To keep the progress bar in the center
const Hidden = styled(BackButton)`
  opacity: 0;
`
