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

import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/sdk'
import { useState } from 'react'
import { ScrollView, Switch, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import ColorPicker from '../components/inputs/ColorPicker'
import Input from '../components/inputs/Input'
import Select, { SelectOption } from '../components/inputs/Select'
import Screen from '../components/layout/Screen'
import { AddressSettings } from '../types/addresses'

export type AddressFormData = AddressSettings & {
  group?: number
}

interface AddressFormProps {
  initialValues: AddressFormData
  onSubmit: (data: AddressFormData) => void
  buttonText?: string
  disableIsMainToggle?: boolean
}

const groupSelectOptions: SelectOption<number | undefined>[] = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map(
  (_, index) => ({
    value: index,
    label: `Group ${index}`
  })
)

const emptyOption = {
  value: undefined,
  label: ''
} as SelectOption<undefined>

groupSelectOptions.unshift(emptyOption)

const AddressForm = ({
  initialValues,
  onSubmit,
  buttonText = 'Generate',
  disableIsMainToggle = false
}: AddressFormProps) => {
  const [label, setLabel] = useState(initialValues.label)
  const [color, setColor] = useState(initialValues.color)
  const [isMain, setIsMain] = useState(initialValues.isMain)
  const [group, setGroup] = useState(initialValues.group)
  const theme = useTheme()

  const toggleIsMain = () => {
    if (!disableIsMainToggle) {
      setIsMain(!isMain)
    }
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between'
        }}
      >
        <View>
          <ScreenSection>
            <Input value={label} onChangeText={setLabel} label="Label" maxLength={50} isTopRounded hasBottomBorder />
            <ColorPicker value={color} onChange={setColor} />
            <HighlightRow
              isBottomRounded
              title="Main address"
              subtitle={`Default address for operations${
                disableIsMainToggle
                  ? '. To remove this address from being the main address, you must set another one as main first.'
                  : ''
              }`}
              onPress={toggleIsMain}
            >
              <Switch
                trackColor={{
                  false: disableIsMainToggle ? theme.bg.tertiary : theme.font.secondary,
                  true: disableIsMainToggle ? theme.bg.tertiary : theme.global.accent
                }}
                thumbColor={theme.font.contrast}
                onValueChange={toggleIsMain}
                value={isMain}
                disabled={disableIsMainToggle}
              />
            </HighlightRow>
          </ScreenSection>
          {initialValues.group === undefined && (
            <ScreenSection>
              <ExpandableRow expandedHeight={90}>
                <Select
                  options={groupSelectOptions}
                  label="Group"
                  value={group}
                  onValueChange={setGroup}
                  isTopRounded
                  isBottomRounded
                />
              </ExpandableRow>
            </ScreenSection>
          )}
        </View>
        <ScreenSection>
          <Button title={buttonText} centered onPress={() => onSubmit({ isMain, label, color, group })} />
        </ScreenSection>
      </ScrollView>
    </Screen>
  )
}

export default AddressForm

const ScreenSection = styled.View`
  padding: 22px 20px;
`
