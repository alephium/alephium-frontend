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
import styled, { useTheme } from 'styled-components/native'

import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import Input from '~/components/inputs/Input'
import Screen, { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'

interface PasswordModalProps {
  onClose: () => void
  onPasswordEntered: (password: string) => void
}

const PasswordModal = ({ onClose, onPasswordEntered }: PasswordModalProps) => {
  const theme = useTheme()

  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    onClose()
    onPasswordEntered(password)
  }

  return (
    <ModalWithBackdrop visible animationType="fade" closeModal={onClose} color={theme.bg.primary}>
      <ScreenStyled>
        <ScreenSectionStyled fill>
          <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry autoFocus />
        </ScreenSectionStyled>
        <ScreenSection centered>
          <ButtonsRow>
            <Button title="Cancel" onPress={onClose} flex />
            <Button title="Submit" onPress={handleSubmit} flex />
          </ButtonsRow>
        </ScreenSection>
      </ScreenStyled>
    </ModalWithBackdrop>
  )
}

export default PasswordModal

const ScreenStyled = styled(Screen)`
  width: 100%;
`

const ScreenSectionStyled = styled(ScreenSection)`
  justify-content: center;
`
