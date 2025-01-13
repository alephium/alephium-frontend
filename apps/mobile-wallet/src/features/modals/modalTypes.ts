import { HasOptionalProps, HasRequiredProps } from '@alephium/shared'
import { ComponentProps } from 'react'

import BiometricsWarningModal from '~/components/BiometricsWarningModal'
import ConsolidationModal from '~/components/ConsolidationModal'
import WalletConnectSessionProposalModal from '~/contexts/walletConnect/WalletConnectSessionProposalModal'
import WalletConnectSessionRequestModal from '~/contexts/walletConnect/WalletConnectSessionRequestModal'
import AddressDetailsModal from '~/features/addressesManagement/AddressDetailsModal'
import AddressSettingsModal from '~/features/addressesManagement/AddressSettingsModal'
import AutoLockOptionsModal from '~/features/auto-lock/AutoLockOptionsModal'
import BackupReminderModal from '~/features/backup/BackupReminderModal'
import BuyModal from '~/features/buy/BuyModal'
import FundPasswordModal from '~/features/fund-password/FundPasswordModal'
import LanguageSelectModal from '~/features/localization/LanguageSelectModal'
import NftGridModal from '~/features/nftsDisplay/NftGridModal'
import NftModal from '~/features/nftsDisplay/NftModal'
import ReceiveQRCodeModal from '~/features/receive/ReceiveQRCodeModal'
import SelectAddressModal from '~/features/send/modals/SelectAddressModal'
import SelectContactModal from '~/features/send/modals/SelectContactModal'
import TokenAmountModal from '~/features/send/modals/TokenAmountModal'
import CurrencySelectModal from '~/features/settings/CurrencySelectModal'
import EditWalletNameModal from '~/features/settings/EditWalletNameModal'
import MnemonicModal from '~/features/settings/MnemonicModal'
import SafePlaceWarningModal from '~/features/settings/SafePlaceWarningModal'
import WalletDeleteModal from '~/features/settings/WalletDeleteModal'
import TransactionModal from '~/features/transactionsDisplay/TransactionModal'
import WalletConnectErrorModal from '~/features/walletconnect/WalletConnectErrorModal'
import WalletConnectPairingsModal from '~/features/walletconnect/WalletConnectPairingsModal'
import WalletConnectPasteUrlModal from '~/features/walletconnect/WalletConnectPasteUrlModal'
import GroupSelectModal from '~/screens/Addresses/Address/GroupSelectModal'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'

export const ModalComponents = {
  BuyModal,
  BackupReminderModal,
  SwitchNetworkModal,
  TransactionModal,
  NftModal,
  NftGridModal,
  WalletDeleteModal,
  BiometricsWarningModal,
  MnemonicModal,
  AutoLockOptionsModal,
  CurrencySelectModal,
  LanguageSelectModal,
  EditWalletNameModal,
  FundPasswordModal,
  SafePlaceWarningModal,
  SelectAddressModal,
  ConsolidationModal,
  SelectContactModal,
  WalletConnectErrorModal,
  WalletConnectPasteUrlModal,
  WalletConnectPairingsModal,
  WalletConnectSessionProposalModal,
  WalletConnectSessionRequestModal,
  GroupSelectModal,
  TokenAmountModal,
  AddressDetailsModal,
  ReceiveQRCodeModal,
  AddressSettingsModal
}

export type ModalName = keyof typeof ModalComponents

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
