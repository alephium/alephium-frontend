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

import { useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import styled, { css } from 'styled-components/native'

import { labelColorPalette } from '../../utils/colors'
import Input from './Input'

export type ColoredLabelInputValue = {
  label: string
  color: string
}

interface ColoredLabelInputProps {
  value: ColoredLabelInputValue
  onChange: ({ label, color }: ColoredLabelInputValue) => void
}

const ColoredLabelInput = ({ value, onChange }: ColoredLabelInputProps) => {
  const [label, setLabel] = useState(value.label)
  const [color, setColor] = useState(value.color)

  useEffect(() => {
    onChange({ label, color })
  }, [color, label, onChange])

  return (
    <View>
      <Input
        label="Address label"
        value={label}
        onChangeText={setLabel}
        autoFocus
        selectionColor={color || undefined}
        color={color || undefined}
        maxLength={50}
      />
      <Colors>
        {labelColorPalette.map((c) => (
          <Color key={c} color={c} onPress={() => setColor(c)} selected={c === color} />
        ))}
      </Colors>
    </View>
  )
}

export default ColoredLabelInput

const Colors = styled(View)`
  flex-direction: row;
  justify-content: space-between;
  margin-top: 20px;
`

const Color = styled(Pressable)<{ color: string; selected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: ${({ color }) => color};
  align-items: center;
  justify-content: center;

  ${({ selected }) =>
    selected &&
    css`
      border: 2px solid black;
    `}
`
