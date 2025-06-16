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
import DAppDetailsModal from '~/features/ecosystem/DAppDetailsModal'
import DAppQuickActionsModal from '~/features/ecosystem/DAppQuickActionsModal'
import ConnectDappModal from '~/features/ecosystem/modals/ConnectDappModal'
import NetworkSwitchModal from '~/features/ecosystem/modals/NetworkSwitchModal'
import NewAddressModal from '~/features/ecosystem/modals/NewAddressModal'
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
          <ModalContextProvider id={id} onUserDismiss={params?.props?.onUserDismiss} key={id}>
            <Modal id={id} params={params} />
          </ModalContextProvider>
        )
      })}
    </ModalsContainer>
  )
}

const Modal = ({ id, params }: Omit<ModalInstance, 'isClosing'>) => {
  switch (params.name) {
    case 'BuyModal':
      return <BuyModal id={id} {...params.props} />
    case 'BackupReminderModal':
      return <BackupReminderModal id={id} {...params.props} />
    case 'SwitchNetworkModal':
      return <SwitchNetworkModal id={id} {...params.props} />
    case 'TransactionModal':
      return <TransactionModal id={id} {...params.props} />
    case 'NftModal':
      return <NftModal id={id} {...params.props} />
    case 'NftGridModal':
      return <NftGridModal id={id} {...params.props} />
    case 'AddressNftsGridModal':
      return <AddressNftsGridModal id={id} {...params.props} />
    case 'WalletDeleteModal':
      return <WalletDeleteModal id={id} {...params.props} />
    case 'BiometricsWarningModal':
      return <BiometricsWarningModal id={id} {...params.props} />
    case 'MnemonicModal':
      return <MnemonicModal id={id} {...params.props} />
    case 'AutoLockOptionsModal':
      return <AutoLockOptionsModal id={id} />
    case 'CurrencySelectModal':
      return <CurrencySelectModal id={id} />
    case 'LanguageSelectModal':
      return <LanguageSelectModal id={id} />
    case 'EditWalletNameModal':
      return <EditWalletNameModal id={id} />
    case 'FundPasswordModal':
      return <FundPasswordModal id={id} {...params.props} />
    case 'SafePlaceWarningModal':
      return <SafePlaceWarningModal id={id} />
    case 'SelectAddressModal':
      return <SelectAddressModal id={id} {...params.props} />
    case 'SelectContactModal':
      return <SelectContactModal id={id} {...params.props} />
    case 'ConsolidationModal':
      return <ConsolidationModal id={id} {...params.props} />
    case 'WalletConnectErrorModal':
      return <WalletConnectErrorModal id={id} {...params.props} />
    case 'WalletConnectPairingsModal':
      return <WalletConnectPairingsModal id={id} {...params.props} />
    case 'WalletConnectPasteUrlModal':
      return <WalletConnectPasteUrlModal id={id} {...params.props} />
    case 'WalletConnectSessionProposalModal':
      return <WalletConnectSessionProposalModal id={id} {...params.props} />
    case 'GroupSelectModal':
      return <GroupSelectModal id={id} {...params.props} />
    case 'TokenAmountModal':
      return <TokenAmountModal id={id} {...params.props} />
    case 'AddressDetailsModal':
      return <AddressDetailsModal id={id} {...params.props} />
    case 'ReceiveQRCodeModal':
      return <ReceiveQRCodeModal id={id} {...params.props} />
    case 'AddressSettingsModal':
      return <AddressSettingsModal id={id} {...params.props} />
    case 'TokenDetailsModal':
      return <TokenDetailsModal id={id} {...params.props} />
    case 'AddressQuickActionsModal':
      return <AddressQuickActionsModal id={id} {...params.props} />
    case 'AddressesWithTokenModal':
      return <AddressesWithTokenModal id={id} {...params.props} />
    case 'SelectTokenToHideModal':
      return <SelectTokenToHideModal id={id} />
    case 'TokenQuickActionsModal':
      return <TokenQuickActionsModal id={id} {...params.props} />
    case 'AddressQRCodeScanActionsModal':
      return <AddressQRCodeScanActionsModal id={id} {...params.props} />
    case 'AddressPickerQuickActionsModal':
      return <AddressPickerQuickActionsModal id={id} {...params.props} />
    case 'DAppQuickActionsModal':
      return <DAppQuickActionsModal id={id} {...params.props} />
    case 'DAppDetailsModal':
      return <DAppDetailsModal id={id} {...params.props} />
    case 'RegionSelectModal':
      return <RegionSelectModal id={id} />
    case 'UnknownTokensModal':
      return <UnknownTokensModal id={id} />
    case 'ConnectDappModal':
      return <ConnectDappModal id={id} {...params.props} />
    case 'NetworkSwitchModal':
      return <NetworkSwitchModal id={id} {...params.props} />
    case 'NewAddressModal':
      return <NewAddressModal id={id} {...params.props} />
    case 'SignExecuteScriptTxModal':
      return <SignExecuteScriptTxModal id={id} {...params.props} />
    case 'SignDeployContractTxModal':
      return <SignDeployContractTxModal id={id} {...params.props} />
    case 'SignTransferTxModal':
      return <SignTransferTxModal id={id} {...params.props} />
    case 'SignUnsignedTxModal':
      return <SignUnsignedTxModal id={id} {...params.props} />
    case 'SignMessageTxModal':
      return <SignMessageTxModal id={id} {...params.props} />
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
