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

import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { map } from 'lodash'

import BoxSurface from '~/components/layout/BoxSurface'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'

interface GroupSelectModalProps extends ModalContentProps {
  selectedGroup?: number
  onSelect: (group?: number) => void
}

const groupSelectOptions = map(Array(TOTAL_NUMBER_OF_GROUPS + 1), (_, i) => ({
  value: i === 0 ? undefined : i - 1,
  label: i === 0 ? 'Default' : `Group ${i - 1}`
}))

const GroupSelectModal = ({ onClose, onSelect, selectedGroup, ...props }: GroupSelectModalProps) => {
  const onGroupSelect = (group?: number) => {
    onSelect(group)
    onClose && onClose()
  }

  return (
    <ModalContent {...props}>
      <ScreenSection>
        <BoxSurface>
          {groupSelectOptions.map((groupOption) => (
            <RadioButtonRow
              key={groupOption.label}
              title={groupOption.label}
              onPress={() => onGroupSelect(groupOption.value)}
              isActive={selectedGroup === groupOption.value}
            />
          ))}
        </BoxSurface>
      </ScreenSection>
    </ModalContent>
  )
}

export default GroupSelectModal
