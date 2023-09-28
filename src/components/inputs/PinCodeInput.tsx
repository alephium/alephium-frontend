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

import { memo, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import styled from 'styled-components/native'

import { PopInFast, PopOutFast } from '~/animations/reanimated/reanimatedAnimations'
import NumberKeyboard, { NumberKeyboardKey } from '~/components/keyboard/NumberKeyboard'

interface PinInputProps {
  pinLength: number
  onPinEntered: (value: string) => Promise<boolean> | boolean
  style?: StyleProp<ViewStyle>
}

interface SlotProps {
  number?: string
}

const PinCodeInput = ({ pinLength, onPinEntered, style }: PinInputProps) => {
  const [pin, setPin] = useState('')

  const renderSlots = () => [...new Array(pinLength)].map((_, i) => <Slot key={i} number={pin[i]} />)

  const handleKeyboardPress = async (key: NumberKeyboardKey) => {
    const newPin = key === 'delete' ? pin.slice(0, -1) : pin.length < pinLength ? pin + key : pin
    setPin(newPin)

    if (newPin.length === pinLength) {
      const shouldClearPin = await onPinEntered(newPin)

      if (shouldClearPin) setPin('')
    }
  }

  return (
    <PinCodeInputStyled style={style}>
      <Slots>{renderSlots()}</Slots>
      <NumberKeyboard onPress={handleKeyboardPress} />
    </PinCodeInputStyled>
  )
}

const Slot = memo(function Slot({ number }: SlotProps) {
  return (
    <SlotContainer>
      {number ? (
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
  background-color: ${({ theme }) => theme.bg.back2};
`

const Slots = styled.View`
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
