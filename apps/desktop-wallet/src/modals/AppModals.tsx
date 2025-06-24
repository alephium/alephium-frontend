import { getElementName, isElementMemoized } from '@alephium/shared-react'
import { AnimatePresence } from 'framer-motion'
import { Children, isValidElement, ReactNode, useEffect } from 'react'

import DeleteAddressesModal from '@/features/addressDeletion/DeleteAddressesModal'
import BuyModal from '@/features/buy/BuyModal'
import { selectAllModals } from '@/features/modals/modalSelectors'
import WalletPassphraseDisclaimerModal from '@/features/passphrase/WalletPassphraseDisclaimerModal'
import SendModal from '@/features/send/SendModal'
import ConfirmLockTimeModal from '@/features/send/sendModals/transfer/ConfirmLockTimeModal'
import WalletUnlockModal from '@/features/switch-wallet/WalletUnlockModal'
import TransactionDetailsModal from '@/features/transactionsDisplay/transactionDetailsModal/TransactionDetailsModal'
import SignDeployContractTxModal from '@/features/walletConnect/SignDeployContractTxModal'
import SignExecuteScriptTxModal from '@/features/walletConnect/SignExecuteScriptTxModal'
import SignMessageModal from '@/features/walletConnect/SignMessageModal'
import SignTransferTxModal from '@/features/walletConnect/SignTransferTxModal'
import SignUnsignedTxModal from '@/features/walletConnect/SignUnsignedTxModal'
import WalletConnectModal from '@/features/walletConnect/WalletConnectModal'
import WalletConnectSessionProposalModal from '@/features/walletConnect/WalletConnectSessionProposalModal'
import WalletQRCodeExportModal from '@/features/walletExport/qrCodeExport/WalletQRCodeExportModal'
import SecretPhraseModal from '@/features/walletExport/secretPhraseExport/SecretPhraseModal'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal/AddressDetailsModal'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import AddressSweepModal from '@/modals/AddressSweepModal'
import ConfirmModal from '@/modals/ConfirmModal'
import ConsolidateUTXOsModal from '@/modals/ConsolidateUTXOsModal'
import ContactFormModal from '@/modals/ContactFormModal'
import CSVExportModal from '@/modals/CSVExportModal'
import CurrentWalletModal from '@/modals/CurrentWalletModal'
import NewAddressModal from '@/modals/NewAddressModal'
import NFTDetailsModal from '@/modals/NFTDetailsModal'
import PasswordConfirmationModal from '@/modals/PasswordConfirmationModal'
import ReceiveModal from '@/modals/ReceiveModal'
import SettingsModal from '@/modals/SettingsModal'
import CopyPrivateKeyConfirmationModal from '@/modals/SettingsModal/CopyPrivateKeyConfirmationModal'
import DisablePasswordRequirementModal from '@/modals/SettingsModal/DisablePasswordRequirementModal'
import EditWalletNameModal from '@/modals/SettingsModal/EditWalletNameModal'
import TokenDetailsModal from '@/modals/tokenDetails/TokenDetailsModal'
import WalletRemovalModal from '@/modals/WalletRemovalModal'
import AdvancedOperationsSideModal from '@/pages/unlockedWallet/addressesPage/AdvancedOperationsSideModal'
import { selectIsWalletUnlocked } from '@/storage/wallets/walletSelectors'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)
  const isWalletUnlocked = useAppSelector(selectIsWalletUnlocked)

  return (
    <AnimatePresenceModalWrapper>
      {isWalletUnlocked
        ? openedModals.map((modal) => {
            const props = { id: modal.id, onUserDismiss: modal.params.onUserDismiss }

            switch (modal.params.name) {
              case 'SettingsModal':
                return <SettingsModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletRemovalModal':
                return <WalletRemovalModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletPassphraseDisclaimerModal':
                return <WalletPassphraseDisclaimerModal key={modal.id} {...props} {...modal.params.props} />
              case 'AddressDetailsModal':
                return <AddressDetailsModal key={modal.id} {...props} {...modal.params.props} />
              case 'CSVExportModal':
                return <CSVExportModal key={modal.id} {...props} {...modal.params.props} />
              case 'NFTDetailsModal':
                return <NFTDetailsModal key={modal.id} {...props} {...modal.params.props} />
              case 'TransactionDetailsModal':
                return <TransactionDetailsModal key={modal.id} {...props} {...modal.params.props} />
              case 'AddressOptionsModal':
                return <AddressOptionsModal key={modal.id} {...props} {...modal.params.props} />
              case 'ReceiveModal':
                return <ReceiveModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletConnectModal':
                return <WalletConnectModal key={modal.id} {...props} />
              case 'SecretPhraseModal':
                return <SecretPhraseModal key={modal.id} {...props} />
              case 'WalletQRCodeExportModal':
                return <WalletQRCodeExportModal key={modal.id} {...props} />
              case 'EditWalletNameModal':
                return <EditWalletNameModal key={modal.id} {...props} />
              case 'CurrentWalletModal':
                return <CurrentWalletModal key={modal.id} {...props} />
              case 'AdvancedOperationsSideModal':
                return <AdvancedOperationsSideModal key={modal.id} {...props} />
              case 'NewAddressModal':
                return <NewAddressModal key={modal.id} {...props} {...modal.params.props} />
              case 'ContactFormModal':
                return <ContactFormModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletUnlockModal':
                return <WalletUnlockModal key={modal.id} {...props} {...modal.params.props} />
              case 'SendModal':
                return <SendModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletConnectSessionProposalModal':
                return <WalletConnectSessionProposalModal key={modal.id} {...props} {...modal.params.props} />
              case 'SignUnsignedTxModal':
                return <SignUnsignedTxModal key={modal.id} {...props} {...modal.params.props} />
              case 'SignMessageModal':
                return <SignMessageModal key={modal.id} {...props} {...modal.params.props} />
              case 'ConsolidateUTXOsModal':
                return <ConsolidateUTXOsModal key={modal.id} {...props} {...modal.params.props} />
              case 'ConfirmLockTimeModal':
                return <ConfirmLockTimeModal key={modal.id} {...props} {...modal.params.props} />
              case 'ConfirmModal':
                return <ConfirmModal key={modal.id} {...props} {...modal.params.props} />
              case 'CopyPrivateKeyConfirmationModal':
                return <CopyPrivateKeyConfirmationModal key={modal.id} {...props} {...modal.params.props} />
              case 'DisablePasswordRequirementModal':
                return <DisablePasswordRequirementModal key={modal.id} {...props} {...modal.params.props} />
              case 'AddressSweepModal':
                return <AddressSweepModal key={modal.id} {...props} {...modal.params.props} />
              case 'DeleteAddressesModal':
                return <DeleteAddressesModal key={modal.id} {...props} />
              case 'BuyModal':
                return <BuyModal key={modal.id} {...props} {...modal.params.props} />
              case 'TokenDetailsModal':
                return <TokenDetailsModal key={modal.id} {...props} {...modal.params.props} />
              case 'PasswordConfirmationModal':
                return <PasswordConfirmationModal key={modal.id} {...props} {...modal.params.props} />
              case 'SignTransferTxModal':
                return <SignTransferTxModal key={modal.id} {...props} {...modal.params.props} />
              case 'SignDeployContractTxModal':
                return <SignDeployContractTxModal key={modal.id} {...props} {...modal.params.props} />
              case 'SignExecuteScriptTxModal':
                return <SignExecuteScriptTxModal key={modal.id} {...props} {...modal.params.props} />
            }
          })
        : openedModals.map((modal) => {
            const props = { id: modal.id, onUserDismiss: modal.params.onUserDismiss }

            switch (modal.params.name) {
              case 'SettingsModal':
                return <SettingsModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletRemovalModal':
                return <WalletRemovalModal key={modal.id} {...props} {...modal.params.props} />
              case 'WalletPassphraseDisclaimerModal':
                return <WalletPassphraseDisclaimerModal key={modal.id} {...props} {...modal.params.props} />
            }
          })}
    </AnimatePresenceModalWrapper>
  )
}

export default AppModals

const AnimatePresenceModalWrapper = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    Children.forEach(children, (child) => {
      if (isValidElement(child) && !isElementMemoized(child)) {
        console.warn(`Warning: ${getElementName(child)} is not memoized! Please wrap it with React.memo().`)
      }
    })
  }, [children])

  return <AnimatePresence>{children}</AnimatePresence>
}
