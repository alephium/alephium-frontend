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

import { HasOptionalProps, HasRequiredProps } from '@alephium/shared'
import { ComponentProps } from 'react'

import BiometricsWarningModal from '~/components/BiometricsWarningModal'
import BackupReminderModal from '~/features/backup/BackupReminderModal'
import BuyModal from '~/features/buy/BuyModal'
import FundPasswordReminderModal from '~/features/fund-password/FundPasswordReminderModal'
import NftGridModal from '~/features/nftsDisplay/NftGridModal'
import NftModal from '~/features/nftsDisplay/NftModal'
import MnemonicModal from '~/features/settings/MnemonicModal'
import WalletDeleteModal from '~/features/settings/WalletDeleteModal'
import TransactionModal from '~/features/transactionsDisplay/TransactionModal'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'

export const ModalComponents = {
  BuyModal,
  FundPasswordReminderModal,
  BackupReminderModal,
  SwitchNetworkModal,
  TransactionModal,
  NftModal,
  NftGridModal,
  WalletDeleteModal,
  BiometricsWarningModal,
  MnemonicModal
}

type ModalName = keyof typeof ModalComponents

type ModalParams<K extends ModalName> =
  HasRequiredProps<ModalPropsMap[K]> extends true
    ? { name: K; props: ModalPropsMap[K] } // Modals with required props
    : HasOptionalProps<ModalPropsMap[K]> extends true
      ? { name: K; props?: ModalPropsMap[K] } // Modals with only optional props
      : { name: K } // Modals with no props

type ModalPropsMap = {
  [K in ModalName]: Omit<ComponentProps<(typeof ModalComponents)[K]>, 'id'>
}

export type OpenModalParams = {
  [K in ModalName]: ModalParams<K>
}[ModalName]

export const getModalComponent = (name: ModalName) => ModalComponents[name]

export type ModalInstance = {
  id: number
  params: OpenModalParams
  isClosing: boolean
}

export interface ModalBaseProp {
  id: ModalInstance['id']
}
