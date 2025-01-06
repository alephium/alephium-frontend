import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import useAddressesDataPolling from '@/features/dataPolling/useAddressesDataPolling'
import { useAppSelector } from '@/hooks/redux'
import AddressesPage from '@/pages/UnlockedWallet/AddressesPage'
import OverviewPage from '@/pages/UnlockedWallet/OverviewPage'
import TransfersPage from '@/pages/UnlockedWallet/TransfersPage'
import UnlockedWalletLayout from '@/pages/UnlockedWallet/UnlockedWalletLayout'
import { loadContacts } from '@/utils/contacts'

const WalletRoutes = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)

  useAddressesDataPolling()

  const headerTitles: { [key: string]: string } = {
    '/wallet/overview': t('Overview'),
    '/wallet/transfers': t('Transfers'),
    '/wallet/addresses': t('Addresses & contacts')
  }

  useEffect(() => {
    if (!activeWalletId) {
      navigate('/')
    } else {
      loadContacts(activeWalletId)
    }
  }, [activeWalletId, navigate])

  return (
    <UnlockedWalletLayout title={headerTitles[location.pathname]}>
      <Routes location={location} key={location.pathname}>
        <Route path="overview" key="overview" element={<OverviewPage />} />
        <Route path="transfers" key="transfers" element={<TransfersPage />} />
        <Route path="addresses" key="addresses" element={<AddressesPage />} />
      </Routes>
    </UnlockedWalletLayout>
  )
}

export default WalletRoutes
