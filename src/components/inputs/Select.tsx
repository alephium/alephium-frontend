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

import { ChevronDown } from 'lucide-react-native'
import { ReactNode, useState } from 'react'
import styled, { useTheme } from 'styled-components/native'

import HighlightRow from '../HighlightRow'
import ModalWithBackdrop from '../ModalWithBackdrop'
import Text from '../Text'
import Input, { InputProps, InputValue } from './Input'

export type SelectOption<T extends InputValue> = {
  value: T
  label: ReactNode
}

export interface SelectProps<T extends InputValue> extends Omit<InputProps<T>, 'value'> {
  options: SelectOption<T>[]
  value: T
  onValueChange: (value: T) => void
  renderValue?: (value: T) => ReactNode
}

function Select<T extends InputValue>({ options, onValueChange, ...props }: SelectProps<T>) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const theme = useTheme()

  const handleOptionPress = (value: T) => {
    onValueChange(value)
    setIsModalOpen(false)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  return (
    <>
      <Input
        editable={false}
        onPress={openModal}
        resetDisabledColor
        IconComponent={<ChevronRight size={24} color={theme.font.secondary} />}
        {...props}
      />
      <ModalWithBackdrop animationType="fade" visible={isModalOpen} closeModal={closeModal}>
        {options.map(({ label, value }, index) => (
          <Option
            onPress={() => handleOptionPress(value)}
            key={value ?? 'none'}
            hasBottomBorder={index !== options.length - 1}
          >
            {typeof label === 'string' ? <Text>{label}</Text> : label}
          </Option>
        ))}
      </ModalWithBackdrop>
    </>
  )
}

export default Select

const Option = styled(HighlightRow)`
  width: 80%;
`

const ChevronRight = styled(ChevronDown)`
  transform: rotate(-90deg);
`
