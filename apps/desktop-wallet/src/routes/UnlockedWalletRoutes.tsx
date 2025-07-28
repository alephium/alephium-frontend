import { useAddressesDataPolling } from '@alephium/shared-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import usePrefetchQueries from '@/api/usePrefetchQueries'
import { useAppSelector } from '@/hooks/redux'
import ActivityPage from '@/pages/unlockedWallet/activityPage/ActivityPage'
import AddressesPage from '@/pages/unlockedWallet/addressesPage/AddressesPage'
import OverviewPage from '@/pages/unlockedWallet/overviewPage/OverviewPage'
import UnlockedWalletLayout from '@/pages/unlockedWallet/UnlockedWalletLayout'
import { loadContacts } from '@/utils/contacts'

const WalletRoutes = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)

  useAddressesDataPolling()
  usePrefetchQueries()

  const headerTitles: { [key: string]: string } = {
    '/wallet/overview': t('Overview'),
    '/wallet/activity': t('Activity'),
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
        <Route path="activity" key="activity" element={<ActivityPage />} />
        <Route path="addresses" key="addresses" element={<AddressesPage />} />
      </Routes>
    </UnlockedWalletLayout>
  )
}

export default WalletRoutes
