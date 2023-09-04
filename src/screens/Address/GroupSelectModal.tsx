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
import { map } from 'lodash'
import React from 'react'

import BoxSurface from '~/components/layout/BoxSurface'
import { ModalProps, ScrollModal } from '~/components/layout/ModalContent'
import { ScreenSection } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useNewAddressContext } from '~/contexts/NewAddressContext'

const groupSelectOptions = map(Array(TOTAL_NUMBER_OF_GROUPS + 1), (_, i) => ({
  value: i === 0 ? undefined : i - 1,
  label: i === 0 ? 'Default' : `Group ${i - 1}`
}))

const GroupSelectModal = ({ onClose, ...props }: ModalProps<ScrollScreenProps>) => {
  const { group, setGroup } = useNewAddressContext()

  const onGroupSelect = (group?: number) => {
    setGroup(group)
    onClose && onClose()
  }

  return (
    <ScrollModal {...props}>
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
    </ScrollModal>
  )
}

export default GroupSelectModal
