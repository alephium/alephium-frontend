import {
  AddressHash,
  ConsolidationTxModalProps,
  SignChainedTxModalProps,
  SignDeployContractTxModalProps,
  SignExecuteScriptTxModalProps,
  SignMessageTxModalProps,
  SignTransferTxModalProps,
  SignUnsignedTxModalProps,
  WalletConnectSessionProposalModalProps
} from '@alephium/shared'

import { BuyModalProps } from '@/features/buy/BuyModal'
import { WalletPassphraseDisclaimerModalProps } from '@/features/passphrase/WalletPassphraseDisclaimerModal'
import { ConfirmLockTimeModalProps } from '@/features/send/sendModal/ConfirmLockTimeModal'
import { SendModalProps } from '@/features/send/sendModal/SendModal'
import { WalletUnlockModalProps } from '@/features/switch-wallet/WalletUnlockModal'
import { TransactionDetailsModalProps } from '@/features/transactionsDisplay/transactionDetailsModal/TransactionDetailsModal'
import { NetworkSwitchModalProps } from '@/features/walletConnect/NetworkSwitchModal'
import { AddressSweepModalProps } from '@/modals/AddressSweepModal'
import { ConfirmModalProps } from '@/modals/ConfirmModal'
import { ContactFormModalProps } from '@/modals/ContactFormModal'
import { NewAddressModalProps } from '@/modals/NewAddressModal'
import { NFTDetailsModalProps } from '@/modals/NFTDetailsModal'
import { PasswordConfirmationModalProps } from '@/modals/PasswordConfirmationModal'
import { SettingsModalProps } from '@/modals/SettingsModal'
import { DisablePasswordRequirementModalProps } from '@/modals/SettingsModal/DisablePasswordRequirementModal'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
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
  SendModal: 'SendModal',
  WalletConnectSessionProposalModal: 'WalletConnectSessionProposalModal',
  SignUnsignedTxModal: 'SignUnsignedTxModal',
  SignMessageTxModal: 'SignMessageTxModal',
  SignConsolidateTxModal: 'SignConsolidateTxModal',
  ConfirmLockTimeModal: 'ConfirmLockTimeModal',
  ConfirmModal: 'ConfirmModal',
  CopyPrivateKeyConfirmationModal: 'CopyPrivateKeyConfirmationModal',
  DisablePasswordRequirementModal: 'DisablePasswordRequirementModal',
  AddressSweepModal: 'AddressSweepModal',
  WalletRemovalModal: 'WalletRemovalModal',
  DeleteAddressesModal: 'DeleteAddressesModal',
  BuyModal: 'BuyModal',
  WalletPassphraseDisclaimerModal: 'WalletPassphraseDisclaimerModal',
  TokenDetailsModal: 'TokenDetailsModal',
  PasswordConfirmationModal: 'PasswordConfirmationModal',
  SignTransferTxModal: 'SignTransferTxModal',
  SignDeployContractTxModal: 'SignDeployContractTxModal',
  SignExecuteScriptTxModal: 'SignExecuteScriptTxModal',
  SignChainedTxModal: 'SignChainedTxModal',
  OfflineModal: 'OfflineModal',
  NetworkSwitchModal: 'NetworkSwitchModal'
} as const

export type ModalName = keyof typeof ModalNames

export type OpenModalParams = {
  onUserDismiss?: () => void
} & (
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
      name: typeof ModalNames.SendModal
      props: SendModalProps
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
      name: typeof ModalNames.SignMessageTxModal
      props: SignMessageTxModalProps
    }
  | {
      name: typeof ModalNames.SignConsolidateTxModal
      props: ConsolidationTxModalProps
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
  | {
      name: typeof ModalNames.TokenDetailsModal
      props: TokenDetailsModalProps
    }
  | {
      name: typeof ModalNames.PasswordConfirmationModal
      props: PasswordConfirmationModalProps
    }
  | {
      name: typeof ModalNames.SignTransferTxModal
      props: SignTransferTxModalProps
    }
  | {
      name: typeof ModalNames.SignDeployContractTxModal
      props: SignDeployContractTxModalProps
    }
  | {
      name: typeof ModalNames.SignExecuteScriptTxModal
      props: SignExecuteScriptTxModalProps
    }
  | {
      name: typeof ModalNames.SignChainedTxModal
      props: SignChainedTxModalProps
    }
  | {
      name: typeof ModalNames.OfflineModal
    }
  | {
      name: typeof ModalNames.NetworkSwitchModal
      props: NetworkSwitchModalProps
    }
)

export type ModalInstance = {
  id: number
  params: OpenModalParams
}

export interface ModalBaseProp {
  id: ModalInstance['id']
  onUserDismiss?: () => void
}

export interface AddressModalBaseProp {
  addressHash: AddressHash
}

export type AddressModalProps = ModalBaseProp & AddressModalBaseProp
