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
import { useEffect, useState } from 'react'
import { PressableProps, View } from 'react-native'
import { Circle as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button, { ButtonProps } from '~/components/buttons/Button'
import BaseHeader from '~/components/headers/BaseHeader'
import { StackHeaderCustomProps } from '~/components/headers/StackHeader'
import { ScreenSection } from '~/components/layout/Screen'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

interface ProgressHeaderProps extends StackHeaderCustomProps {
  workflow: 'send' | 'receive'
}

const workflowSteps: Record<
  ProgressHeaderProps['workflow'],
  (keyof ReceiveNavigationParamList)[] | (keyof SendNavigationParamList)[]
> = {
  receive: ['AddressScreen', 'QRCodeScreen'],
  send: ['DestinationScreen', 'OriginScreen', 'AssetsScreen', 'VerifyScreen']
}

const ProgressHeader = ({ navigation, route, workflow, options }: ProgressHeaderProps) => {
  const theme = useTheme()

  const [progress, setProgress] = useState(0)

  const steps = workflowSteps[workflow]

  useEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? steps[0]
    const currentStepIndex = steps.findIndex((step) => step === routeName)

    if (currentStepIndex !== -1) setProgress((currentStepIndex + 1) / steps.length)
  }, [route, steps])

  return (
    <BaseHeader
      options={{
        ...options,
        headerRight: () => (
          <View>
            {options.headerRight && <HeaderRightOptionWrapper>{options.headerRight({})}</HeaderRightOptionWrapper>}
            <ProgressBar
              progress={progress}
              color={theme.global.accent}
              unfilledColor={theme.border.secondary}
              fill="transparent"
              strokeCap="round"
              borderWidth={0}
              size={43}
              pointerEvents="none"
            />
          </View>
        ),
        headerLeft: () => options.headerLeft && options.headerLeft({})
      }}
    />
  )
}

export default ProgressHeader

export const CloseButton = (props: ButtonProps) => (
  <Button onPress={props.onPress} iconProps={{ name: 'close-outline' }} round {...props} />
)

export const ContinueButton = (props: ButtonProps) => (
  <Button onPress={props.onPress} iconProps={{ name: 'arrow-forward-outline' }} round {...props} />
)

export const BackButton = (props: ButtonProps) => (
  <Button onPress={props.onPress} iconProps={{ name: 'arrow-back-outline' }} round {...props} />
)

export const BackButtonStyled = styled.Pressable`
  width: 30px;
  height: 30px;
  border-radius: 30px;
  background-color: ${({ theme }) => theme.bg.secondary};
  align-items: center;
  justify-content: center;
`

const HeaderRightOptionWrapper = styled.View`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
`

// TODO: Dry
export const ContinueButtonStyled = styled.Pressable`
  padding: 4px 15px;
  background-color: ${({ theme }) => theme.global.accent};
  border-radius: 26px;
  width: 100px;
  align-items: center;
`
