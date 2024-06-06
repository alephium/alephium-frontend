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
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import { autoLockSecondsOptions } from '~/features/auto-lock/utils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { autoLockSecondsChanged } from '~/store/settingsSlice'

const AutoLockOptionsModal = ({ onClose, ...props }: ModalContentProps) => {
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const handleAutoLockChange = (seconds: number) => {
    dispatch(autoLockSecondsChanged(seconds))
    onClose && onClose()
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        <BoxSurface>
          {autoLockSecondsOptions.map((autoLockOption) => (
            <RadioButtonRow
              key={autoLockOption.label}
              title={autoLockOption.label}
              onPress={() => handleAutoLockChange(autoLockOption.value)}
              isActive={autoLockSeconds === autoLockOption.value}
            />
          ))}
        </BoxSurface>
      </ScreenSection>
    </ModalContent>
  )
}

export default AutoLockOptionsModal
