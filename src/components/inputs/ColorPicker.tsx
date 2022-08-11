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
import { Modal, StyleProp, Text, ViewStyle } from 'react-native'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import styled from 'styled-components/native'

import { labelColorPalette } from '../../utils/colors'
import HighlightRow from '../HighlightRow'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  style?: StyleProp<ViewStyle>
}

const ColorPicker = ({ value, onChange, style }: ColorPickerProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const handleColorPress = (color: string) => {
    onChange(color)
    setIsModalVisible(false)
  }

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setIsModalVisible(!isModalVisible)}>
        <HighlightRow style={style}>
          <Text>Color</Text>
          <Dot color={value} />
        </HighlightRow>
      </TouchableWithoutFeedback>
      <Modal animationType="fade" visible={isModalVisible}>
        <ModalContent>
          <Colors>
            {labelColorPalette.map((c) => (
              <Color key={c} color={c} onPress={() => handleColorPress(c)} />
            ))}
          </Colors>
        </ModalContent>
      </Modal>
    </>
  )
}

export default styled(ColorPicker)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const Dot = styled.View<{ color: string }>`
  height: 15px;
  width: 15px;
  border-radius: 15px;
  background-color: ${({ color }) => color};
`

const Colors = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
  width: 100%;
`

const Color = memo(styled.Pressable<{ color: string; selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${({ color }) => color};
  align-items: center;
  justify-content: center;
`)

const ModalContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`
