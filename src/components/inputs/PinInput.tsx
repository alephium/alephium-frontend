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

import React from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

interface PinInputProps {
  value: string
  onPinChange: (value: string) => void
  style?: StyleProp<ViewStyle>
}

interface SlotProps {
  number: string | undefined
}

const PinInput = ({ value, onPinChange, style }: PinInputProps) => {
  const renderSlots = () => {
    return [...new Array(6)].map((_, i) => <Slot key={i} number={value[i]} />)
  }

  return (
    <View style={style}>
      <HiddenTextInput value={value} onChangeText={onPinChange} autoFocus keyboardType="phone-pad" />
      <Slots>{renderSlots()}</Slots>
    </View>
  )
}

const Slot = ({ number }: SlotProps) => <SlotContainer>{number ? <FilledSlot /> : <EmptySlot />}</SlotContainer>

export default styled(PinInput)`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 50px;
`

const HiddenTextInput = styled.TextInput`
  opacity: 0;
  position: absolute;
`

const Slots = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const SlotContainer = styled(View)`
  width: 15%;
  justify-content: center;
  align-items: center;
`

const FilledSlot = styled.View`
  border-radius: 50px;
  background-color: ${({ theme }) => theme.font.primary};
  height: 10px;
  width: 10px;
`

const EmptySlot = styled.View`
  border-bottom-width: 2px;
  border-bottom-color: ${({ theme }) => theme.font.primary};

  width: 10px;
`
