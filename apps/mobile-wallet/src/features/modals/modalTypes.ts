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

import BackupReminderModal, { BackupReminderModalProps } from '~/features/backup/BackupReminderModal'
import BuyModal from '~/features/buy/BuyModal'
import FundPasswordReminderModal from '~/features/fund-password/FundPasswordReminderModal'

export const ModalComponents = {
  BuyModal,
  FundPasswordReminderModal,
  BackupReminderModal
}

export interface ModalPropsMap {
  BuyModal: undefined
  FundPasswordReminderModal: undefined
  BackupReminderModal: BackupReminderModalProps
}

export type ModalName = keyof typeof ModalComponents

export const getModalComponent = (name: ModalName) => ModalComponents[name]

export type OpenModalParams = {
  [K in ModalName]: { name: K; props?: ModalPropsMap[K] }
}[ModalName]

export type ModalInstance = {
  id: number
  params: OpenModalParams
  isClosing: boolean
}

export interface ModalRequiredProps {
  id: ModalInstance['id']
}
