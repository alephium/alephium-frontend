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

import { memo, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated'
import styled from 'styled-components/native'

import { PopInFast, PopOutFast } from '~/animations/reanimated/reanimatedAnimations'
import NumberKeyboard, { NumberKeyboardKey } from '~/components/keyboard/NumberKeyboard'
import { ImpactStyle, vibrate } from '~/utils/haptics'

interface PinInputProps {
  pinLength: number
  onPinEntered: (value: string) => Promise<boolean> | boolean
  style?: StyleProp<ViewStyle>
}

interface SlotProps {
  value?: string
}

const PinCodeInput = ({ pinLength, onPinEntered, style }: PinInputProps) => {
  const [pin, setPin] = useState('')
  const pinTranslation = useSharedValue(0)
  const pinOpacity = useSharedValue(1)

  const animatedSlotsStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pinTranslation.value }],
    opacity: pinOpacity.value
  }))

  const renderSlots = () => [...new Array(pinLength)].map((_, i) => <Slot key={i} value={pin[i]} />)

  const handleKeyboardPress = async (key: NumberKeyboardKey) => {
    vibrate(ImpactStyle.Medium)

    const newPin = key === 'delete' ? pin.slice(0, -1) : pin.length < pinLength ? pin + key : pin
    setPin(newPin)

    if (newPin.length === pinLength) {
      // Intermediate animation to give time to understand what's going on
      const onPinEnteredCallback = async () => {
        const shouldClearPin = await onPinEntered(newPin)
        if (shouldClearPin) {
          setPin('')
        }
      }

      pinOpacity.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 150 }, () => {
          runOnJS(onPinEnteredCallback)()
        })
      )
    }
  }

  return (
    <PinCodeInputStyled>
      <Slots style={animatedSlotsStyle}>{renderSlots()}</Slots>
      <NumberKeyboard onPress={handleKeyboardPress} />
    </PinCodeInputStyled>
  )
}

const Slot = memo(function Slot({ value }: SlotProps) {
  return (
    <SlotContainer>
      {value ? (
        <FilledSlot entering={PopInFast} exiting={PopOutFast} />
      ) : (
        <EmptySlot entering={PopInFast} exiting={PopOutFast} />
      )}
    </SlotContainer>
  )
})

export default PinCodeInput

const PinCodeInputStyled = styled.View`
  flex: 1;
  background-color: ${({ theme }) => (theme.name === 'dark' ? theme.bg.back2 : theme.bg.highlight)};
`

const Slots = styled(Animated.View)`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const SlotContainer = styled.View`
  width: 8%;
  justify-content: center;
  align-items: center;
  height: 20px;
  margin-bottom: 15%;
`

const FilledSlot = styled(Animated.View)`
  position: absolute;

  border-radius: 50px;
  background-color: ${({ theme }) => theme.font.primary};
  height: 16px;
  width: 16px;
`

const EmptySlot = styled(Animated.View)`
  position: absolute;

  border-bottom-width: 2px;
  border-bottom-color: ${({ theme }) => theme.font.primary};

  width: 10px;
`
