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

import React, { useState } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import NumberKeyboard, { NumberKeyboardKey } from '../keyboard/NumberKeyboard'

interface PinInputProps {
  pinLenght: number
  value: string
  onPinChange: (value: string) => void
  style?: StyleProp<ViewStyle>
}

interface SlotProps {
  number: string | undefined
}

const PinCodeInput = ({ pinLenght, value, onPinChange, style }: PinInputProps) => {
  const [pin, setPin] = useState(value)

  const renderSlots = () => {
    return [...new Array(pinLenght)].map((_, i) => <Slot key={i} number={value[i]} />)
  }

  const handleKeyboardPress = (key: NumberKeyboardKey) => {
    const newPin = key === 'delete' ? pin.slice(0, -1) : pin.length < pinLenght ? pin + key : pin
    setPin(newPin)
    onPinChange(newPin)
  }

  return (
    <View style={style}>
      <Slots>{renderSlots()}</Slots>
      <NumberKeyboard onPress={handleKeyboardPress} />
    </View>
  )
}

const Slot = ({ number }: SlotProps) => <SlotContainer>{number ? <FilledSlot /> : <EmptySlot />}</SlotContainer>

export default styled(PinCodeInput)`
  flex: 1;
`

const Slots = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const SlotContainer = styled.View`
  width: 12%;
  justify-content: center;
  align-items: center;
`

const FilledSlot = styled.View`
  border-radius: 50px;
  background-color: ${({ theme }) => theme.font.primary};
  height: 12px;
  width: 12px;
`

const EmptySlot = styled.View`
  border-bottom-width: 2px;
  border-bottom-color: ${({ theme }) => theme.font.primary};

  width: 10px;
`
