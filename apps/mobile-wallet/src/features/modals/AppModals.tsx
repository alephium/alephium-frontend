import { Children, isValidElement, ReactNode, useEffect } from 'react'
import styled from 'styled-components/native'

import BiometricsWarningModal from '~/components/BiometricsWarningModal'
import ConsolidationModal from '~/components/ConsolidationModal'
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
import SignDeployContractTxModal from '~/features/ecosystem/modals/SignDeployContractTxModal'
import SignExecuteScriptTxModal from '~/features/ecosystem/modals/SignExecuteScriptTxModal'
import SignMessageTxModal from '~/features/ecosystem/modals/SignMessageTxModal'
import SignTransferTxModal from '~/features/ecosystem/modals/SignTransferTxModal'
import SignUnsignedTxModal from '~/features/ecosystem/modals/SignUnsignedTxModal'
import FundPasswordModal from '~/features/fund-password/FundPasswordModal'
import LanguageSelectModal from '~/features/localization/LanguageSelectModal'
import ModalContextProvider from '~/features/modals/ModalContext'
import { selectAllModals } from '~/features/modals/modalSelectors'
import { ModalInstance } from '~/features/modals/modalTypes'
import { getElementName, isModalWrapped } from '~/features/modals/modalUtils'
import AddressQRCodeScanActionsModal from '~/features/qrCodeScan/AddressQRCodeScanActionsModal'
import ReceiveQRCodeModal from '~/features/receive/ReceiveQRCodeModal'
import SelectAddressModal from '~/features/send/modals/SelectAddressModal'
import SelectContactModal from '~/features/send/modals/SelectContactModal'
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
import { useAppSelector } from '~/hooks/redux'
import AddressPickerQuickActionsModal from '~/modals/AddressPickerQuickActionsModal'
import DataFetchErrorModal from '~/modals/DataFetchErrorModal'
import UnknownTokensModal from '~/modals/UnknownTokensModal'
import GroupSelectModal from '~/screens/Addresses/Address/GroupSelectModal'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'

const AppModals = () => {
  const isUnlocked = useAppSelector((s) => s.wallet.isUnlocked)
  const openedModals = useAppSelector(selectAllModals)

  if (!isUnlocked) {
    return null
  }

  return (
    <ModalsContainer>
      {openedModals.map((modal) => {
        const { id, params } = modal

        return (
          <ModalContextProvider id={id} onUserDismiss={params.onUserDismiss} key={id}>
            <Modal params={params} />
          </ModalContextProvider>
        )
      })}
    </ModalsContainer>
  )
}

const Modal = ({ params }: Omit<ModalInstance, 'isClosing' | 'id'>) => {
  switch (params.name) {
    case 'BuyModal':
      return <BuyModal {...params.props} />
    case 'BackupReminderModal':
      return <BackupReminderModal {...params.props} />
    case 'SwitchNetworkModal':
      return <SwitchNetworkModal {...params.props} />
    case 'TransactionModal':
      return <TransactionModal {...params.props} />
    case 'NftModal':
      return <NftModal {...params.props} />
    case 'NftGridModal':
      return <NftGridModal {...params.props} />
    case 'AddressNftsGridModal':
      return <AddressNftsGridModal {...params.props} />
    case 'WalletDeleteModal':
      return <WalletDeleteModal {...params.props} />
    case 'BiometricsWarningModal':
      return <BiometricsWarningModal {...params.props} />
    case 'MnemonicModal':
      return <MnemonicModal {...params.props} />
    case 'AutoLockOptionsModal':
      return <AutoLockOptionsModal />
    case 'CurrencySelectModal':
      return <CurrencySelectModal />
    case 'LanguageSelectModal':
      return <LanguageSelectModal />
    case 'EditWalletNameModal':
      return <EditWalletNameModal />
    case 'FundPasswordModal':
      return <FundPasswordModal {...params.props} />
    case 'SafePlaceWarningModal':
      return <SafePlaceWarningModal />
    case 'SelectAddressModal':
      return <SelectAddressModal {...params.props} />
    case 'SelectContactModal':
      return <SelectContactModal {...params.props} />
    case 'ConsolidationModal':
      return <ConsolidationModal {...params.props} />
    case 'WalletConnectErrorModal':
      return <WalletConnectErrorModal />
    case 'WalletConnectPairingsModal':
      return <WalletConnectPairingsModal {...params.props} />
    case 'WalletConnectPasteUrlModal':
      return <WalletConnectPasteUrlModal />
    case 'WalletConnectSessionProposalModal':
      return <WalletConnectSessionProposalModal {...params.props} />
    case 'GroupSelectModal':
      return <GroupSelectModal {...params.props} />
    case 'TokenAmountModal':
      return <TokenAmountModal {...params.props} />
    case 'AddressDetailsModal':
      return <AddressDetailsModal {...params.props} />
    case 'ReceiveQRCodeModal':
      return <ReceiveQRCodeModal {...params.props} />
    case 'AddressSettingsModal':
      return <AddressSettingsModal {...params.props} />
    case 'TokenDetailsModal':
      return <TokenDetailsModal {...params.props} />
    case 'AddressQuickActionsModal':
      return <AddressQuickActionsModal {...params.props} />
    case 'AddressesWithTokenModal':
      return <AddressesWithTokenModal {...params.props} />
    case 'SelectTokenToHideModal':
      return <SelectTokenToHideModal />
    case 'TokenQuickActionsModal':
      return <TokenQuickActionsModal {...params.props} />
    case 'AddressQRCodeScanActionsModal':
      return <AddressQRCodeScanActionsModal {...params.props} />
    case 'AddressPickerQuickActionsModal':
      return <AddressPickerQuickActionsModal {...params.props} />
    case 'DAppQuickActionsModal':
      return <DAppQuickActionsModal {...params.props} />
    case 'DAppDetailsModal':
      return <DAppDetailsModal {...params.props} />
    case 'RegionSelectModal':
      return <RegionSelectModal />
    case 'UnknownTokensModal':
      return <UnknownTokensModal />
    case 'ConnectDappModal':
      return <ConnectDappModal {...params.props} />
    case 'NetworkSwitchModal':
      return <NetworkSwitchModal {...params.props} />
    case 'SignExecuteScriptTxModal':
      return <SignExecuteScriptTxModal {...params.props} />
    case 'SignDeployContractTxModal':
      return <SignDeployContractTxModal {...params.props} />
    case 'SignTransferTxModal':
      return <SignTransferTxModal {...params.props} />
    case 'SignUnsignedTxModal':
      return <SignUnsignedTxModal {...params.props} />
    case 'SignMessageTxModal':
      return <SignMessageTxModal {...params.props} />
    case 'EditDappUrlModal':
      return <EditDappUrlModal {...params.props} />
    case 'DataFetchErrorModal':
      return <DataFetchErrorModal {...params.props} />
    case 'ConnectTipModal':
      return <ConnectTipModal />
    default:
      return null
  }
}

interface ModalsContainerProps {
  children: ReactNode
}

const ModalsContainer = ({ children }: ModalsContainerProps) => {
  const hasOpenedModals = useAppSelector((s) => selectAllModals(s).length > 0)

  useEffect(() => {
    Children.forEach(children, (child) => {
      if (isValidElement(child) && !isModalWrapped(child)) {
        console.warn(`Warning: ${getElementName(child)} is not wrapped! Please wrap it with the memo function.`)
      }
    })
  }, [children])

  return <ModalsContainerStyled pointerEvents={hasOpenedModals ? 'auto' : 'none'}>{children}</ModalsContainerStyled>
}

export default AppModals

const ModalsContainerStyled = styled.View`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`
