import { Children, isValidElement, ReactNode, useEffect } from 'react'
import styled from 'styled-components/native'

import BiometricsWarningModal from '~/components/BiometricsWarningModal'
import ConsolidationModal from '~/components/ConsolidationModal'
import WalletConnectSessionProposalModal from '~/contexts/walletConnect/WalletConnectSessionProposalModal'
import WalletConnectSessionRequestModal from '~/contexts/walletConnect/WalletConnectSessionRequestModal'
import AddressDetailsModal from '~/features/addressesManagement/AddressDetailsModal'
import AddressQuickActionsModal from '~/features/addressesManagement/AddressQuickActionsModal'
import AddressSettingsModal from '~/features/addressesManagement/AddressSettingsModal'
import AutoLockOptionsModal from '~/features/auto-lock/AutoLockOptionsModal'
import BackupReminderModal from '~/features/backup/BackupReminderModal'
import BuyModal from '~/features/buy/BuyModal'
import FundPasswordModal from '~/features/fund-password/FundPasswordModal'
import LanguageSelectModal from '~/features/localization/LanguageSelectModal'
import { selectAllModals } from '~/features/modals/modalSelectors'
import { getElementName, isModalWrapped } from '~/features/modals/modalUtils'
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
import AddressesWithTokenModal from '~/features/tokenDisplay/tokenDetailsModal/AddressesWithTokenModal'
import TokenDetailsModal from '~/features/tokenDisplay/tokenDetailsModal/TokenDetailsModal'
import TransactionModal from '~/features/transactionsDisplay/TransactionModal'
import WalletConnectErrorModal from '~/features/walletconnect/WalletConnectErrorModal'
import WalletConnectPairingsModal from '~/features/walletconnect/WalletConnectPairingsModal'
import WalletConnectPasteUrlModal from '~/features/walletconnect/WalletConnectPasteUrlModal'
import { useAppSelector } from '~/hooks/redux'
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

        switch (params.name) {
          case 'BuyModal':
            return <BuyModal key={id} id={id} {...params.props} />
          case 'BackupReminderModal':
            return <BackupReminderModal key={id} id={id} {...params.props} />
          case 'SwitchNetworkModal':
            return <SwitchNetworkModal key={id} id={id} {...params.props} />
          case 'TransactionModal':
            return <TransactionModal key={id} id={id} {...params.props} />
          case 'NftModal':
            return <NftModal key={id} id={id} {...params.props} />
          case 'NftGridModal':
            return <NftGridModal key={id} id={id} {...params.props} />
          case 'WalletDeleteModal':
            return <WalletDeleteModal key={id} id={id} {...params.props} />
          case 'BiometricsWarningModal':
            return <BiometricsWarningModal key={id} id={id} {...params.props} />
          case 'MnemonicModal':
            return <MnemonicModal key={id} id={id} {...params.props} />
          case 'AutoLockOptionsModal':
            return <AutoLockOptionsModal key={id} id={id} />
          case 'CurrencySelectModal':
            return <CurrencySelectModal key={id} id={id} />
          case 'LanguageSelectModal':
            return <LanguageSelectModal key={id} id={id} />
          case 'EditWalletNameModal':
            return <EditWalletNameModal key={id} id={id} />
          case 'FundPasswordModal':
            return <FundPasswordModal key={id} id={id} {...params.props} />
          case 'SafePlaceWarningModal':
            return <SafePlaceWarningModal key={id} id={id} />
          case 'SelectAddressModal':
            return <SelectAddressModal key={id} id={id} {...params.props} />
          case 'SelectContactModal':
            return <SelectContactModal key={id} id={id} {...params.props} />
          case 'ConsolidationModal':
            return <ConsolidationModal key={id} id={id} {...params.props} />
          case 'WalletConnectErrorModal':
            return <WalletConnectErrorModal key={id} id={id} {...params.props} />
          case 'WalletConnectPairingsModal':
            return <WalletConnectPairingsModal key={id} id={id} {...params.props} />
          case 'WalletConnectPasteUrlModal':
            return <WalletConnectPasteUrlModal key={id} id={id} {...params.props} />
          case 'WalletConnectSessionProposalModal':
            return <WalletConnectSessionProposalModal key={id} id={id} {...params.props} />
          case 'GroupSelectModal':
            return <GroupSelectModal key={id} id={id} {...params.props} />
          case 'WalletConnectSessionRequestModal':
            return <WalletConnectSessionRequestModal key={id} id={id} {...params.props} />
          case 'TokenAmountModal':
            return <TokenAmountModal key={id} id={id} {...params.props} />
          case 'AddressDetailsModal':
            return <AddressDetailsModal key={id} id={id} {...params.props} />
          case 'ReceiveQRCodeModal':
            return <ReceiveQRCodeModal key={id} id={id} {...params.props} />
          case 'AddressSettingsModal':
            return <AddressSettingsModal key={id} id={id} {...params.props} />
          case 'TokenDetailsModal':
            return <TokenDetailsModal key={id} id={id} {...params.props} />
          case 'AddressQuickActionsModal':
            return <AddressQuickActionsModal key={id} id={id} {...params.props} />
          case 'AddressesWithTokenModal':
            return <AddressesWithTokenModal key={id} id={id} {...params.props} />
          default:
            return null
        }
      })}
    </ModalsContainer>
  )
}

interface ModalsContainerProps {
  children: ReactNode
}

const ModalsContainer = ({ children }: ModalsContainerProps) => {
  const hasOpenedModals = useAppSelector((s) => selectAllModals(s).length > 0)

  useEffect(() => {
    Children.forEach(children, (child) => {
      if (isValidElement(child) && !isModalWrapped(child)) {
        console.warn(`Warning: ${getElementName(child)} is not wrapped! Please wrap it with the withModal function.`)
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
