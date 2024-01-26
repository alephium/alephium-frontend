/*
Copyright 2018 - 2024 The Alephium Authors
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

import { ReactNode, useState } from 'react'
import { View } from 'react-native'
import { Portal } from 'react-native-portalize'

import AppText from '~/components/AppText'
import { ContinueButton } from '~/components/buttons/Button'
import ExpandableRow from '~/components/ExpandableRow'
import ColorPicker from '~/components/inputs/ColorPicker'
import Input from '~/components/inputs/Input'
import BottomModal from '~/components/layout/BottomModal'
import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import GroupSelectModal from '~/screens/Addresses/Address/GroupSelectModal'
import { AddressSettings } from '~/types/addresses'

export type AddressFormData = AddressSettings & {
  group?: number
}

interface AddressFormProps extends ScrollScreenProps {
  initialValues: AddressFormData
  onSubmit: (data: AddressFormData) => void
  screenTitle: string
  allowGroupSelection?: boolean
  buttonText?: string
  disableIsMainToggle?: boolean
  HeaderComponent?: ReactNode
}

const AddressForm = ({
  initialValues,
  onSubmit,
  screenTitle,
  allowGroupSelection,
  buttonText = 'Generate',
  disableIsMainToggle = false,
  HeaderComponent,
  headerOptions,
  ...props
}: AddressFormProps) => {
  const [label, setLabel] = useState(initialValues.label)
  const [color, setColor] = useState(initialValues.color)
  const [isDefault, setIsDefault] = useState(initialValues.isDefault)
  const [group, setGroup] = useState<number>()
  const [isGroupSelectModalOpen, setIsGroupSelectModalOpen] = useState(false)

  const toggleIsMain = () => {
    if (!disableIsMainToggle) {
      setIsDefault(!isDefault)
    }
  }

  return (
    <>
      <ScrollScreen
        usesKeyboard
        fill
        verticalGap
        screenTitle={screenTitle}
        headerOptions={{
          type: 'stack',
          headerRight: () => (
            <ContinueButton
              title={buttonText}
              onPress={() => onSubmit({ isDefault, label, color, group })}
              iconProps={undefined}
            />
          ),
          headerTitle: screenTitle,
          ...headerOptions
        }}
        {...props}
      >
        <View>{HeaderComponent}</View>
        <ScreenSection verticalGap fill>
          <Input value={label} onChangeText={setLabel} label="Label" maxLength={50} />
          <ColorPicker value={color} onChange={setColor} />
          <BoxSurface>
            <Row
              title="Default address"
              subtitle={`Default address for operations${
                disableIsMainToggle
                  ? '. To remove this address from being the default address, you must set another one as main first.'
                  : ''
              }`}
              onPress={toggleIsMain}
              isLast
            >
              <Toggle onValueChange={toggleIsMain} value={isDefault} disabled={disableIsMainToggle} />
            </Row>
          </BoxSurface>

          {allowGroupSelection && (
            <ExpandableRow>
              <BoxSurface>
                <Row title="Address group" onPress={() => setIsGroupSelectModalOpen(true)}>
                  <AppText>{group !== undefined ? `Group ${group}` : 'Default'}</AppText>
                </Row>
              </BoxSurface>
            </ExpandableRow>
          )}
        </ScreenSection>
      </ScrollScreen>
      <Portal>
        <BottomModal
          isOpen={isGroupSelectModalOpen}
          onClose={() => setIsGroupSelectModalOpen(false)}
          Content={(props) => (
            <GroupSelectModal onClose={() => setIsGroupSelectModalOpen(false)} onSelect={setGroup} {...props} />
          )}
        />
      </Portal>
    </>
  )
}

export default AddressForm
