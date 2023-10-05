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

import { Modal, ModalProps } from 'react-native'
import styled from 'styled-components/native'

export interface ModalWithBackdropProps extends ModalProps {
  closeModal?: () => void
  color?: string
}

const ModalWithBackdrop = ({ children, closeModal, color, ...props }: ModalWithBackdropProps) => (
  <Modal transparent={true} animationType="none" {...props}>
    <ModalBackdrop onPress={closeModal} color={color} />
    <ModalContent>{children}</ModalContent>
  </Modal>
)

export default ModalWithBackdrop

const ModalContent = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
`

const ModalBackdrop = styled.Pressable<{ color?: string }>`
  flex: 1;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: ${({ color }) => color || 'rgba(0, 0, 0, 0.5)'};
`
