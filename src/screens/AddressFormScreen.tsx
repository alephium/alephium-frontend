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
import { ScrollView, Switch } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import Button from '../components/buttons/Button'
import ExpandableRow from '../components/ExpandableRow'
import HighlightRow from '../components/HighlightRow'
import ColorPicker from '../components/inputs/ColorPicker'
import Input from '../components/inputs/Input'
import Select, { SelectOption } from '../components/inputs/Select'
import Screen from '../components/layout/Screen'

interface AddressFormProps {
  initialValues: {
    isMain: boolean
    color?: string
    label?: string
    group?: number
  }
  onSubmit: (isMain: boolean, label?: string, color?: string, group?: number) => void
  buttonText?: string
}

const groupSelectOptions: SelectOption<number>[] = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map((_, index) => ({
  value: index,
  label: `Group ${index}`
}))

const AddressForm = ({ initialValues, onSubmit, buttonText = 'Generate' }: AddressFormProps) => {
  const [label, setLabel] = useState(initialValues.label)
  const [color, setColor] = useState(initialValues.color)
  const [isMain, setIsMain] = useState(initialValues.isMain)
  const [group, setGroup] = useState(initialValues.group)
  const theme = useTheme()

  const toggleIsMain = () => setIsMain(!isMain)

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between'
        }}
      >
        <TopContent>
          <ScreenSection>
            <Input value={label} onChangeText={setLabel} label="Label" maxLength={50} isTopRounded hasBottomBorder />
            <ColorPicker value={color} onChange={setColor} />
            <HighlightRow
              isBottomRounded
              title="Main address"
              subtitle="Default address for operations"
              onPress={toggleIsMain}
            >
              <Switch
                trackColor={{ false: theme.font.secondary, true: theme.global.accent }}
                thumbColor={theme.font.contrast}
                onValueChange={toggleIsMain}
                value={isMain}
              />
            </HighlightRow>
          </ScreenSection>
          {initialValues.group === undefined && (
            <ScreenSection>
              <ExpandableRow expandedHeight={90}>
                <Select
                  options={groupSelectOptions}
                  allowEmpty
                  label="Group"
                  value={group}
                  onValueChange={setGroup}
                  isTopRounded
                  isBottomRounded
                />
              </ExpandableRow>
            </ScreenSection>
          )}
        </TopContent>
        <BottomContent>
          <ScreenSection>
            <Button title={buttonText} centered onPress={() => onSubmit(isMain, label, color, group)} />
          </ScreenSection>
        </BottomContent>
      </ScrollView>
    </Screen>
  )
}

export default AddressForm

const ScreenSection = styled.View`
  padding: 22px 20px;
`

const TopContent = styled.View``

const BottomContent = styled.View``
