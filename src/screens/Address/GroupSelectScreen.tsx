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

import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useEffect } from 'react'

import BottomModalHeader from '~/components/headers/BottomModalHeader'
import { SelectOption } from '~/components/inputs/Select'
import BoxSurface from '~/components/layout/BoxSurface'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useNewAddressContext } from '~/contexts/NewAddressContext'
import { NewAddressNavigationParamList } from '~/navigation/NewAddressNavigation'

type ScreenProps = StackScreenProps<NewAddressNavigationParamList, 'GroupSelectScreen'>

const groupSelectOptions: SelectOption<number | undefined>[] = Array.from(Array(TOTAL_NUMBER_OF_GROUPS)).map(
  (_, index) => ({
    value: index,
    label: `Group ${index}`
  })
)

groupSelectOptions.unshift({
  value: undefined,
  label: 'Default'
} as SelectOption<undefined>)

const GroupSelectScreen = ({ navigation }: ScreenProps) => {
  const { group, setGroup } = useNewAddressContext()

  const onGroupSelect = (group?: number) => {
    setGroup(group)
    navigation.goBack()
  }

  useEffect(() => {
    navigation.setOptions({
      header: () => (
        <BottomModalHeader>
          <ScreenSection>
            <BottomModalScreenTitle>Address group</BottomModalScreenTitle>
          </ScreenSection>
        </BottomModalHeader>
      )
    })
  }, [navigation])

  return (
    <ScrollScreen>
      <ScreenSection>
        <BoxSurface>
          {groupSelectOptions.map((groupOption) => (
            <RadioButtonRow
              key={groupOption.label}
              title={groupOption.label}
              onPress={() => onGroupSelect(groupOption.value)}
              isActive={group === groupOption.value}
            />
          ))}
        </BoxSurface>
      </ScreenSection>
    </ScrollScreen>
  )
}

export default GroupSelectScreen
