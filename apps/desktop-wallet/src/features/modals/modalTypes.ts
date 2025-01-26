import { AddressHash, WalletConnectSessionProposalModalProps } from '@alephium/shared'

import { BuyModalProps } from '@/features/buy/BuyModal'
import { WalletPassphraseDisclaimerModalProps } from '@/features/passphrase/WalletPassphraseDisclaimerModal'
import { CallContractSendModalProps } from '@/features/send/sendModals/callContract/CallContractSendModal'
import { DeployContractSendModalProps } from '@/features/send/sendModals/deployContract/DeployContractSendModal'
import { ConfirmLockTimeModalProps } from '@/features/send/sendModals/transfer/ConfirmLockTimeModal'
import { TransferSendModalProps } from '@/features/send/sendModals/transfer/TransferSendModal'
import { WalletUnlockModalProps } from '@/features/switch-wallet/WalletUnlockModal'
import { TransactionDetailsModalProps } from '@/features/transactionsDisplay/transactionDetailsModal/TransactionDetailsModal'
import { SignMessageModalProps } from '@/features/walletConnect/SignMessageModal'
import { SignUnsignedTxModalProps } from '@/features/walletConnect/SignUnsignedTxModal'
import { AddressSweepModalProps } from '@/modals/AddressSweepModal'
import { ConfirmModalProps } from '@/modals/ConfirmModal'
import { ConsolidateUTXOsModalProps } from '@/modals/ConsolidateUTXOsModal'
import { ContactFormModalProps } from '@/modals/ContactFormModal'
import { NewAddressModalProps } from '@/modals/NewAddressModal'
import { NFTDetailsModalProps } from '@/modals/NFTDetailsModal'
import { SettingsModalProps } from '@/modals/SettingsModal'
import { DisablePasswordRequirementModalProps } from '@/modals/SettingsModal/DisablePasswordRequirementModal'
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
  WalletRemovalModal: 'WalletRemovalModal',
  DeleteAddressesModal: 'DeleteAddressesModal',
  BuyModal: 'BuyModal',
  WalletPassphraseDisclaimerModal: 'WalletPassphraseDisclaimerModal'
} as const

export type ModalName = keyof typeof ModalNames

export type OpenModalParams =
  | {
      name: typeof ModalNames.AddressDetailsModal
      props: AddressModalBaseProp
    }
  | {
      name: typeof ModalNames.CSVExportModal
      props: AddressModalBaseProp
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
      props: AddressModalBaseProp
    }
  | {
      name: typeof ModalNames.SettingsModal
      props: SettingsModalProps
    }
  | {
      name: typeof ModalNames.ReceiveModal
      props: AddressModalBaseProp
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
      props: AddressModalBaseProp
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
  | {
      name: typeof ModalNames.DeleteAddressesModal
    }
  | {
      name: typeof ModalNames.BuyModal
      props: BuyModalProps
    }
  | {
      name: typeof ModalNames.WalletPassphraseDisclaimerModal
      props: WalletPassphraseDisclaimerModalProps
    }

export type ModalInstance = {
  id: number
  params: OpenModalParams
}

export interface ModalBaseProp {
  id: ModalInstance['id']
}

export interface AddressModalBaseProp {
  addressHash: AddressHash
}

export type AddressModalProps = ModalBaseProp & AddressModalBaseProp
