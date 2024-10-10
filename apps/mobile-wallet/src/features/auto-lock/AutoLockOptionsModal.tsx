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

import BoxSurface from '~/components/layout/BoxSurface'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { autoLockSecondsOptions } from '~/features/auto-lock/utils'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { autoLockSecondsChanged } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const AutoLockOptionsModal = withModal(({ id }) => {
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const handleAutoLockChange = (seconds: number) => {
    dispatch(autoLockSecondsChanged(seconds))
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal
      modalId={id}
      Content={(props) => (
        <ModalContent {...props} verticalGap>
          <ScreenSection>
            <BoxSurface>
              {autoLockSecondsOptions.map((autoLockOption, index) => (
                <RadioButtonRow
                  key={autoLockOption.label}
                  title={autoLockOption.label}
                  onPress={() => handleAutoLockChange(autoLockOption.value)}
                  isActive={autoLockSeconds === autoLockOption.value}
                  isLast={index === autoLockSecondsOptions.length - 1}
                />
              ))}
            </BoxSurface>
          </ScreenSection>
        </ModalContent>
      )}
    />
  )
})

export default AutoLockOptionsModal
