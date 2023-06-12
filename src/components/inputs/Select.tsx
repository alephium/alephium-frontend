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

import AppText from '~/components/AppText'
import HighlightRow from '~/components/HighlightRow'
import Input, { InputProps, InputValue, RenderValueFunc } from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'

export type SelectOption<T extends InputValue> = {
  value: T
  label: ReactNode
}

export interface SelectProps<T extends InputValue> extends Omit<InputProps<T>, 'value'> {
  options: SelectOption<T>[]
  value: T
  onValueChange: (value: T) => void
  renderValue?: RenderValueFunc<T>
}

const Select = <T extends InputValue>({ options, onValueChange, value, renderValue }: SelectProps<T>) => {
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
        RightContent={<ChevronRight size={24} color={theme.font.secondary} />}
        value={value}
        renderValue={renderValue}
        label=""
      />
      <ModalWithBackdrop animationType="fade" visible={isModalOpen} closeModal={closeModal}>
        <BoxSurface>
          {options.map(({ label, value }, index) => (
            <HighlightRow
              onPress={() => handleOptionPress(value)}
              key={JSON.stringify(value) + (label ?? '') + index}
              isLast={index === options.length - 1}
            >
              {typeof label === 'string' ? <AppText>{label}</AppText> : label}
            </HighlightRow>
          ))}
        </BoxSurface>
      </ModalWithBackdrop>
    </>
  )
}

export default Select

const ChevronRight = styled(ChevronDown)`
  transform: rotate(-90deg);
`
