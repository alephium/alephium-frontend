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

import QRCode from 'react-qr-code'

import { AddressHash } from '../types/addresses'
import ModalWithBackdrop from './ModalWithBackdrop'

interface QRCodeModalProps {
  addressHash: AddressHash
  isOpen: boolean
  onClose: () => void
}

const QRCodeModal = ({ addressHash, isOpen, onClose }: QRCodeModalProps) => (
  <ModalWithBackdrop animationType="fade" visible={isOpen} closeModal={onClose}>
    <QRCode size={256} style={{ height: 'auto', maxWidth: '100%', width: '100%' }} value={addressHash} />
  </ModalWithBackdrop>
)

export default QRCodeModal
