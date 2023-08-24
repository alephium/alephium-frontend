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

import { useState } from 'react'
import { View } from 'react-native'
import { useModalize } from 'react-native-modalize'
import { Portal } from 'react-native-portalize'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ExpandableRow from '~/components/ExpandableRow'
import HighlightRow from '~/components/HighlightRow'
import ColorPicker from '~/components/inputs/ColorPicker'
import Input from '~/components/inputs/Input'
import BoxSurface from '~/components/layout/BoxSurface'
import Modalize from '~/components/layout/Modalize'
import { BottomScreenSection, ScreenSection } from '~/components/layout/Screen'
import Toggle from '~/components/Toggle'
import GroupSelectModal from '~/screens/Address/GroupSelectModal'
import { AddressHash, AddressSettings } from '~/types/addresses'

export type AddressFormData = AddressSettings & {
  group?: number
}

interface AddressFormProps {
  initialValues: AddressFormData
  onSubmit: (data: AddressFormData) => void
  allowGroupSelection?: boolean
  buttonText?: string
  disableIsMainToggle?: boolean
  addressHash?: AddressHash
}

const AddressForm = ({
  initialValues,
  onSubmit,
  allowGroupSelection,
  buttonText = 'Generate',
  disableIsMainToggle = false
}: AddressFormProps) => {
  const { ref: groupSelectModalRef, open: openGroupSelectModal, close: closeGroupSelectModal } = useModalize()

  const [label, setLabel] = useState(initialValues.label)
  const [color, setColor] = useState(initialValues.color)
  const [isDefault, setIsDefault] = useState(initialValues.isDefault)
  const [group, setGroup] = useState<number>()

  const toggleIsMain = () => {
    if (!disableIsMainToggle) {
      setIsDefault(!isDefault)
    }
  }

  return (
    <>
      <View style={{ flexGrow: 1 }}>
        <ScreenSection>
          <BoxSurface>
            <Input value={label} onChangeText={setLabel} label="Label" maxLength={50} />
            <ColorPicker value={color} onChange={setColor} />
            <HighlightRow
              title="Default address"
              subtitle={`Default address for operations${
                disableIsMainToggle
                  ? '. To remove this address from being the default address, you must set another one as main first.'
                  : ''
              }`}
              onPress={toggleIsMain}
            >
              <Toggle onValueChange={toggleIsMain} value={isDefault} disabled={disableIsMainToggle} />
            </HighlightRow>
          </BoxSurface>
        </ScreenSection>
        {allowGroupSelection && (
          <ScreenSection>
            <ExpandableRow>
              <BoxSurface>
                <HighlightRow title="Address group" onPress={() => openGroupSelectModal()}>
                  <AppText>{group !== undefined ? `Group ${group}` : 'Default'}</AppText>
                </HighlightRow>
              </BoxSurface>
            </ExpandableRow>
          </ScreenSection>
        )}
      </View>
      <BottomScreenSection>
        <Button title={buttonText} centered onPress={() => onSubmit({ isDefault, label, color, group })} />
      </BottomScreenSection>

      <Portal>
        <Modalize ref={groupSelectModalRef}>
          <GroupSelectModal selectedGroup={group} onSelect={setGroup} onClose={closeGroupSelectModal} />
        </Modalize>
      </Portal>
    </>
  )
}

export default AddressForm
