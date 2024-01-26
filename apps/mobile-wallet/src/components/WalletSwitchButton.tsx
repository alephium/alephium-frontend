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

import { BlurMask, Canvas, Circle, Group, SweepGradient, vec } from '@shopify/react-native-skia'
import { useEffect, useState } from 'react'
import { Pressable, StyleProp, ViewStyle } from 'react-native'
import { useSharedValue, withDelay, withRepeat, withSequence, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface WalletSwitchButtonProps {
  isLoading: boolean
  style?: StyleProp<ViewStyle>
}

const buttonSize = 40

const WalletSwitchButton = ({ isLoading, style }: WalletSwitchButtonProps) => {
  const gradientOpacity = useSharedValue(0)
  const [nbOfTaps, setNbOfTaps] = useState(0)
  const [isDoingMagic, setIsDoingMagic] = useState(false)
  const theme = useTheme()

  const loopAnimation = withRepeat(
    withSequence(withDelay(1000, withTiming(0.9, { duration: 1000 })), withTiming(0.3, { duration: 4000 })),
    -1,
    true
  )

  useEffect(() => {
    gradientOpacity.value = loopAnimation
  }, [gradientOpacity, loopAnimation])

  const handlePress = () => {
    vibrate(ImpactStyle.Light)

    gradientOpacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withTiming(0.3, { duration: 1000 }, () => (gradientOpacity.value = loopAnimation))
    )

    setNbOfTaps((p) => p + 1)

    if (isDoingMagic) {
      setIsDoingMagic(false)
      setNbOfTaps(0)
    }

    if (nbOfTaps === 68) {
      setIsDoingMagic(true)
      sendAnalytics('Activated magic')
    }
  }

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>

    if (isDoingMagic) {
      interval = setInterval(() => {
        vibrate(ImpactStyle.Heavy)
      }, 30)
    }
    return () => clearInterval(interval)
  }, [isDoingMagic])

  return (
    <Pressable onPress={handlePress}>
      <Container style={[style]}>
        <AlephiumLogo color={theme.name === 'light' ? 'white' : 'black'} />
        <BackgroundCanvas style={{ height: buttonSize * 4, width: buttonSize * 4 }}>
          <Group opacity={gradientOpacity}>
            <Circle cx={buttonSize / 2 + DEFAULT_MARGIN} cy={buttonSize / 2 + DEFAULT_MARGIN} r={buttonSize / 2}>
              <SweepGradient
                c={vec(buttonSize / 2 + DEFAULT_MARGIN, buttonSize / 2 + DEFAULT_MARGIN)}
                colors={['#FF4385', '#61A1F6', '#FF7D26', '#FF4385']}
              />
              <BlurMask blur={8} style="normal" />
            </Circle>
          </Group>
        </BackgroundCanvas>
      </Container>
    </Pressable>
  )
}

export default WalletSwitchButton

const Container = styled.View`
  padding: 10px;
  height: ${buttonSize}px;
  width: ${buttonSize}px;
  border-radius: ${buttonSize}px;
  background-color: ${({ theme }) => theme.bg.contrast};
`

const BackgroundCanvas = styled(Canvas)`
  position: absolute;
  z-index: -1;
  left: -${DEFAULT_MARGIN}px;
  top: -${DEFAULT_MARGIN}px;
`
