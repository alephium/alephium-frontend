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

import { getElementName, isElementMemoized } from '@alephium/shared-react'
import { AnimatePresence } from 'framer-motion'
import { Children, isValidElement, ReactNode, useEffect } from 'react'

import { selectAllModals } from '@/features/modals/modalSelectors'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import ContactFormModal from '@/modals/ContactFormModal'
import CSVExportModal from '@/modals/CSVExportModal'
import NewAddressModal from '@/modals/NewAddressModal'
import NFTDetailsModal from '@/modals/NFTDetailsModal'
import NotificationsModal from '@/modals/NotificationsModal'
import ReceiveModal from '@/modals/ReceiveModal'
import SecretPhraseModal from '@/modals/SecretPhraseModal'
import SettingsModal from '@/modals/SettingsModal'
import EditWalletNameModal from '@/modals/SettingsModal/EditWalletNameModal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import WalletConnectModal from '@/modals/WalletConnectModal'
import WalletQRCodeExportModal from '@/modals/WalletQRCodeExportModal'
import AdvancedOperationsSideModal from '@/pages/UnlockedWallet/AddressesPage/AdvancedOperationsSideModal'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)

  if (openedModals.length === 0) return null

  return (
    <AnimatePresenceModalWrapper>
      {openedModals.map((modal) => {
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
          case 'SettingsModal':
            return <SettingsModal id={modal.id} key={modal.id} {...modal.params.props} />
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
          case 'NotificationsModal':
            return <NotificationsModal id={modal.id} key={modal.id} />
          case 'AdvancedOperationsSideModal':
            return <AdvancedOperationsSideModal id={modal.id} key={modal.id} />
          case 'NewAddressModal':
            return <NewAddressModal id={modal.id} key={modal.id} {...modal.params.props} />
          case 'ContactFormModal':
            return <ContactFormModal id={modal.id} key={modal.id} {...modal.params.props} />
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
