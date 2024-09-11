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

import { CallContractSendModalProps } from '@/features/send/callContract'
import { DeployContractSendModalProps } from '@/features/send/deployContract'
import { TransferSendModalProps } from '@/features/send/Transfer'
import { ConfirmLockTimeModalProps } from '@/features/send/Transfer/ConfirmLockTimeModal'
import { WalletUnlockModalProps } from '@/features/switch-wallet/WalletUnlockModal'
import { SignMessageModalProps } from '@/features/walletConnect/SignMessageModal'
import { SignUnsignedTxModalProps } from '@/features/walletConnect/SignUnsignedTxModal'
import { WalletConnectSessionProposalModalProps } from '@/features/walletConnect/WalletConnectSessionProposalModal'
import { AddressDetailsModalProps } from '@/modals/AddressDetailsModal'
import { AddressOptionsModalProps } from '@/modals/AddressOptionsModal'
import { AddressSweepModalProps } from '@/modals/AddressSweepModal'
import { ConfirmModalProps } from '@/modals/ConfirmModal'
import { ConsolidateUTXOsModalProps } from '@/modals/ConsolidateUTXOsModal'
import { ContactFormModalProps } from '@/modals/ContactFormModal'
import { CSVExportModalProps } from '@/modals/CSVExportModal'
import { NewAddressModalProps } from '@/modals/NewAddressModal'
import { NFTDetailsModalProps } from '@/modals/NFTDetailsModal'
import { ReceiveModalProps } from '@/modals/ReceiveModal'
import { SettingsModalProps } from '@/modals/SettingsModal'
import { CopyPrivateKeyConfirmationModalProps } from '@/modals/SettingsModal/CopyPrivateKeyConfirmationModal'
import { DisablePasswordRequirementModalProps } from '@/modals/SettingsModal/DisablePasswordRequirementModal'
import { TransactionDetailsModalProps } from '@/modals/TransactionDetailsModal'
import { WalletRemovalModalProps } from '@/modals/WalletRemovalModal'

const ModalNames = {
  AddressDetailsModal: 'AddressDetailsModal',
  CSVExportModal: 'CSVExportModal',
  NFTDetailsModal: 'NFTDetailsModal',
  TransactionDetailsModal: 'TransactionDetailsModal',
  AddressOptionsModal: 'AddressOptionsModal',
  SettingsModal: 'SettingsModal',
  ReceiveModal: 'ReceiveModal',
  WalletConnectModal: 'WalletConnectModal',
  SecretPhraseModal: 'SecretPhraseModal',
  WalletQRCodeExportModal: 'WalletQRCodeExportModal',
  EditWalletNameModal: 'EditWalletNameModal',
  CurrentWalletModal: 'CurrentWalletModal',
  AdvancedOperationsSideModal: 'AdvancedOperationsSideModal',
  NewAddressModal: 'NewAddressModal',
  ContactFormModal: 'ContactFormModal',
  WalletUnlockModal: 'WalletUnlockModal',
  TransferSendModal: 'TransferSendModal',
  CallContractSendModal: 'CallContractSendModal',
  DeployContractSendModal: 'DeployContractSendModal',
  WalletConnectSessionProposalModal: 'WalletConnectSessionProposalModal',
  SignUnsignedTxModal: 'SignUnsignedTxModal',
  SignMessageModal: 'SignMessageModal',
  ConsolidateUTXOsModal: 'ConsolidateUTXOsModal',
  ConfirmLockTimeModal: 'ConfirmLockTimeModal',
  ConfirmModal: 'ConfirmModal',
  CopyPrivateKeyConfirmationModal: 'CopyPrivateKeyConfirmationModal',
  DisablePasswordRequirementModal: 'DisablePasswordRequirementModal',
  AddressSweepModal: 'AddressSweepModal',
  WalletRemovalModal: 'WalletRemovalModal'
} as const

export type ModalName = keyof typeof ModalNames

export type OpenModalParams =
  | {
      name: typeof ModalNames.AddressDetailsModal
      props: AddressDetailsModalProps
    }
  | {
      name: typeof ModalNames.CSVExportModal
      props: CSVExportModalProps
    }
  | {
      name: typeof ModalNames.NFTDetailsModal
      props: NFTDetailsModalProps
    }
  | {
      name: typeof ModalNames.TransactionDetailsModal
      props: TransactionDetailsModalProps
    }
  | {
      name: typeof ModalNames.AddressOptionsModal
      props: AddressOptionsModalProps
    }
  | {
      name: typeof ModalNames.SettingsModal
      props: SettingsModalProps
    }
  | {
      name: typeof ModalNames.ReceiveModal
      props: ReceiveModalProps
    }
  | {
      name: typeof ModalNames.WalletConnectModal
    }
  | {
      name: typeof ModalNames.SecretPhraseModal
    }
  | {
      name: typeof ModalNames.WalletQRCodeExportModal
    }
  | {
      name: typeof ModalNames.EditWalletNameModal
    }
  | {
      name: typeof ModalNames.CurrentWalletModal
    }
  | {
      name: typeof ModalNames.AdvancedOperationsSideModal
    }
  | {
      name: typeof ModalNames.NewAddressModal
      props: NewAddressModalProps
    }
  | {
      name: typeof ModalNames.ContactFormModal
      props: ContactFormModalProps
    }
  | {
      name: typeof ModalNames.WalletUnlockModal
      props: WalletUnlockModalProps
    }
  | {
      name: typeof ModalNames.TransferSendModal
      props: TransferSendModalProps
    }
  | {
      name: typeof ModalNames.CallContractSendModal
      props: CallContractSendModalProps
    }
  | {
      name: typeof ModalNames.DeployContractSendModal
      props: DeployContractSendModalProps
    }
  | {
      name: typeof ModalNames.WalletConnectSessionProposalModal
      props: WalletConnectSessionProposalModalProps
    }
  | {
      name: typeof ModalNames.SignUnsignedTxModal
      props: SignUnsignedTxModalProps
    }
  | {
      name: typeof ModalNames.SignMessageModal
      props: SignMessageModalProps
    }
  | {
      name: typeof ModalNames.ConsolidateUTXOsModal
      props: ConsolidateUTXOsModalProps
    }
  | {
      name: typeof ModalNames.ConfirmLockTimeModal
      props: ConfirmLockTimeModalProps
    }
  | {
      name: typeof ModalNames.ConfirmModal
      props: ConfirmModalProps
    }
  | {
      name: typeof ModalNames.CopyPrivateKeyConfirmationModal
      props: CopyPrivateKeyConfirmationModalProps
    }
  | {
      name: typeof ModalNames.DisablePasswordRequirementModal
      props: DisablePasswordRequirementModalProps
    }
  | {
      name: typeof ModalNames.AddressSweepModal
      props: AddressSweepModalProps
    }
  | {
      name: typeof ModalNames.WalletRemovalModal
      props: WalletRemovalModalProps
    }

export type ModalInstance = {
  id: number
  params: OpenModalParams
}

export interface ModalBaseProp {
  id: ModalInstance['id']
}
