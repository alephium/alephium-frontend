import { getElementName, isElementMemoized } from '@alephium/shared-react'
import { AnimatePresence } from 'framer-motion'
import { Children, isValidElement, ReactNode, useEffect } from 'react'

import DeleteAddressesModal from '@/features/addressDeletion/DeleteAddressesModal'
import BuyModal from '@/features/buy/BuyModal'
import { selectAllModals } from '@/features/modals/modalSelectors'
import WalletPassphraseDisclaimerModal from '@/features/passphrase/WalletPassphraseDisclaimerModal'
import CallContractSendModal from '@/features/send/sendModals/callContract/CallContractSendModal'
import DeployContractSendModal from '@/features/send/sendModals/deployContract/DeployContractSendModal'
import ConfirmLockTimeModal from '@/features/send/sendModals/transfer/ConfirmLockTimeModal'
import TransferSendModal from '@/features/send/sendModals/transfer/TransferSendModal'
import WalletUnlockModal from '@/features/switch-wallet/WalletUnlockModal'
import TransactionDetailsModal from '@/features/transactionsDisplay/transactionDetailsModal/TransactionDetailsModal'
import SignMessageModal from '@/features/walletConnect/SignMessageModal'
import SignUnsignedTxModal from '@/features/walletConnect/SignUnsignedTxModal'
import WalletConnectModal from '@/features/walletConnect/WalletConnectModal'
import WalletConnectSessionProposalModal from '@/features/walletConnect/WalletConnectSessionProposalModal'
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
import ReceiveModal from '@/modals/ReceiveModal'
import SecretPhraseModal from '@/modals/SecretPhraseModal'
import SettingsModal from '@/modals/SettingsModal'
import CopyPrivateKeyConfirmationModal from '@/modals/SettingsModal/CopyPrivateKeyConfirmationModal'
import DisablePasswordRequirementModal from '@/modals/SettingsModal/DisablePasswordRequirementModal'
import EditWalletNameModal from '@/modals/SettingsModal/EditWalletNameModal'
import WalletQRCodeExportModal from '@/modals/WalletQRCodeExportModal'
import WalletRemovalModal from '@/modals/WalletRemovalModal'
import AdvancedOperationsSideModal from '@/pages/UnlockedWallet/AddressesPage/AdvancedOperationsSideModal'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)
  const isWalletUnlocked = useAppSelector((s) => !!s.activeWallet.id)

  return (
    <AnimatePresenceModalWrapper>
      {openedModals.map((modal) => {
        switch (modal.params.name) {
          case 'SettingsModal':
            return <SettingsModal id={modal.id} key={modal.id} {...modal.params.props} />
          case 'WalletRemovalModal':
            return <WalletRemovalModal id={modal.id} key={modal.id} {...modal.params.props} />
          case 'WalletPassphraseDisclaimerModal':
            return <WalletPassphraseDisclaimerModal id={modal.id} key={modal.id} {...modal.params.props} />
        }
      })}

      {isWalletUnlocked &&
        openedModals.map((modal) => {
          switch (modal.params.name) {
            case 'AddressDetailsModal':
              return <AddressDetailsModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'CSVExportModal':
              return <CSVExportModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'NFTDetailsModal':
              return <NFTDetailsModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'TransactionDetailsModal':
              return <TransactionDetailsModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'AddressOptionsModal':
              return <AddressOptionsModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'ReceiveModal':
              return <ReceiveModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'WalletConnectModal':
              return <WalletConnectModal id={modal.id} key={modal.id} />
            case 'SecretPhraseModal':
              return <SecretPhraseModal id={modal.id} key={modal.id} />
            case 'WalletQRCodeExportModal':
              return <WalletQRCodeExportModal id={modal.id} key={modal.id} />
            case 'EditWalletNameModal':
              return <EditWalletNameModal id={modal.id} key={modal.id} />
            case 'CurrentWalletModal':
              return <CurrentWalletModal id={modal.id} key={modal.id} />
            case 'AdvancedOperationsSideModal':
              return <AdvancedOperationsSideModal id={modal.id} key={modal.id} />
            case 'NewAddressModal':
              return <NewAddressModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'ContactFormModal':
              return <ContactFormModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'WalletUnlockModal':
              return <WalletUnlockModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'TransferSendModal':
              return <TransferSendModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'CallContractSendModal':
              return <CallContractSendModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'DeployContractSendModal':
              return <DeployContractSendModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'WalletConnectSessionProposalModal':
              return <WalletConnectSessionProposalModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'SignUnsignedTxModal':
              return <SignUnsignedTxModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'SignMessageModal':
              return <SignMessageModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'ConsolidateUTXOsModal':
              return <ConsolidateUTXOsModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'ConfirmLockTimeModal':
              return <ConfirmLockTimeModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'ConfirmModal':
              return <ConfirmModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'CopyPrivateKeyConfirmationModal':
              return <CopyPrivateKeyConfirmationModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'DisablePasswordRequirementModal':
              return <DisablePasswordRequirementModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'AddressSweepModal':
              return <AddressSweepModal id={modal.id} key={modal.id} {...modal.params.props} />
            case 'DeleteAddressesModal':
              return <DeleteAddressesModal id={modal.id} key={modal.id} />
            case 'BuyModal':
              return <BuyModal id={modal.id} key={modal.id} {...modal.params.props} />
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
