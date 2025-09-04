import { HasOptionalProps, HasRequiredProps } from '@alephium/shared'
import { ComponentProps } from 'react'

import BiometricsWarningModal from '~/components/BiometricsWarningModal'
import WalletConnectSessionProposalModal from '~/contexts/walletConnect/WalletConnectSessionProposalModal'
import AddressDetailsModal from '~/features/addressesManagement/AddressDetailsModal'
import AddressNftsGridModal from '~/features/addressesManagement/AddressNftsGridModal'
import AddressQuickActionsModal from '~/features/addressesManagement/AddressQuickActionsModal'
import AddressSettingsModal from '~/features/addressesManagement/AddressSettingsModal'
import SelectTokenToHideModal from '~/features/assetsDisplay/hideTokens/SelectTokenToHideModal'
import NftGridModal from '~/features/assetsDisplay/nftsDisplay/NftGridModal'
import NftModal from '~/features/assetsDisplay/nftsDisplay/NftModal'
import AddressesWithTokenModal from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/AddressesWithTokenModal'
import TokenDetailsModal from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/TokenDetailsModal'
import TokenQuickActionsModal from '~/features/assetsDisplay/tokenDisplay/TokenQuickActionsModal'
import AutoLockOptionsModal from '~/features/auto-lock/AutoLockOptionsModal'
import BackupReminderModal from '~/features/backup/BackupReminderModal'
import BuyModal from '~/features/buy/BuyModal'
import ConnectTipModal from '~/features/connectTip/ConnectTipModal'
import DAppDetailsModal from '~/features/ecosystem/DAppDetailsModal'
import DAppQuickActionsModal from '~/features/ecosystem/DAppQuickActionsModal'
import EditDappUrlModal from '~/features/ecosystem/EditDappUrlModal'
import ConnectDappModal from '~/features/ecosystem/modals/ConnectDappModal'
import NetworkSwitchModal from '~/features/ecosystem/modals/NetworkSwitchModal'
import SignChainedTxModal from '~/features/ecosystem/modals/SignChainedTxModal'
import SignDeployContractTxModal from '~/features/ecosystem/modals/SignDeployContractTxModal'
import SignExecuteScriptTxModal from '~/features/ecosystem/modals/SignExecuteScriptTxModal'
import SignMessageTxModal from '~/features/ecosystem/modals/SignMessageTxModal'
import SignTransferTxModal from '~/features/ecosystem/modals/SignTransferTxModal'
import SignUnsignedTxModal from '~/features/ecosystem/modals/SignUnsignedTxModal'
import FundPasswordModal from '~/features/fund-password/FundPasswordModal'
import LanguageSelectModal from '~/features/localization/LanguageSelectModal'
import AddressQRCodeScanActionsModal from '~/features/qrCodeScan/AddressQRCodeScanActionsModal'
import ReceiveQRCodeModal from '~/features/receive/ReceiveQRCodeModal'
import SelectAddressModal from '~/features/send/modals/SelectAddressModal'
import SelectContactModal from '~/features/send/modals/SelectContactModal'
import SignConsolidateTxModal from '~/features/send/modals/SignConsolidateTxModal'
import TokenAmountModal from '~/features/send/modals/TokenAmountModal'
import CurrencySelectModal from '~/features/settings/CurrencySelectModal'
import EditWalletNameModal from '~/features/settings/EditWalletNameModal'
import MnemonicModal from '~/features/settings/MnemonicModal'
import RegionSelectModal from '~/features/settings/regionSettings/RegionSelectModal'
import SafePlaceWarningModal from '~/features/settings/SafePlaceWarningModal'
import WalletDeleteModal from '~/features/settings/WalletDeleteModal'
import TransactionModal from '~/features/transactionsDisplay/TransactionModal'
import WalletConnectErrorModal from '~/features/walletconnect/WalletConnectErrorModal'
import WalletConnectPairingsModal from '~/features/walletconnect/WalletConnectPairingsModal'
import WalletConnectPasteUrlModal from '~/features/walletconnect/WalletConnectPasteUrlModal'
import AddressPickerQuickActionsModal from '~/modals/AddressPickerQuickActionsModal'
import DataFetchErrorModal from '~/modals/DataFetchErrorModal'
import UnknownTokensModal from '~/modals/UnknownTokensModal'
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
  SignConsolidateTxModal,
  SelectContactModal,
  WalletConnectErrorModal,
  WalletConnectPasteUrlModal,
  WalletConnectPairingsModal,
  WalletConnectSessionProposalModal,
  GroupSelectModal,
  TokenAmountModal,
  AddressDetailsModal,
  ReceiveQRCodeModal,
  AddressSettingsModal,
  TokenDetailsModal,
  AddressQuickActionsModal,
  AddressesWithTokenModal,
  SelectTokenToHideModal,
  TokenQuickActionsModal,
  AddressQRCodeScanActionsModal,
  AddressPickerQuickActionsModal,
  DAppQuickActionsModal,
  DAppDetailsModal,
  RegionSelectModal,
  UnknownTokensModal,
  AddressNftsGridModal,
  ConnectDappModal,
  NetworkSwitchModal,
  SignExecuteScriptTxModal,
  SignDeployContractTxModal,
  SignTransferTxModal,
  SignUnsignedTxModal,
  SignMessageTxModal,
  EditDappUrlModal,
  DataFetchErrorModal,
  ConnectTipModal,
  SignChainedTxModal
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
}[ModalName] & { onUserDismiss?: () => void }

export type ModalInstance = {
  id: string
  params: OpenModalParams
  isClosing: boolean
}
