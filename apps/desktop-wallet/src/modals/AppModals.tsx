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

import { AnimatePresence } from 'framer-motion'

import { selectAllModals } from '@/features/modals/modalSelectors'
import { useAppSelector } from '@/hooks/redux'
import AddressDetailsModal from '@/modals/AddressDetailsModal'
import AddressOptionsModal from '@/modals/AddressOptionsModal'
import CSVExportModal from '@/modals/CSVExportModal'
import NFTDetailsModal from '@/modals/NFTDetailsModal'
import ReceiveModal from '@/modals/ReceiveModal'
import SecretPhraseModal from '@/modals/SecretPhraseModal'
import SettingsModal from '@/modals/SettingsModal'
import TransactionDetailsModal from '@/modals/TransactionDetailsModal'
import WalletConnectModal from '@/modals/WalletConnectModal'

const AppModals = () => {
  const openedModals = useAppSelector(selectAllModals)

  return (
    <AnimatePresence>
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
        }
      })}
    </AnimatePresence>
  )
}

export default AppModals
