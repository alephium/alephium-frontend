import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { FloatingPanel } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import NewWalletActions from '@/pages/welcomePage/NewWalletActions'
import UnlockPanel from '@/pages/welcomePage/UnlockPanel'

const WelcomePageWithExistingWallets = () => {
  const { t } = useTranslation()

  const [showNewWalletActions, setShowNewWalletActions] = useState(false)

  if (showNewWalletActions) {
    return (
      <FloatingPanel>
        <PanelTitle centerText>{t('New wallet')}</PanelTitle>
        <NewWalletActions onExistingWalletLinkClick={() => setShowNewWalletActions(false)} />
      </FloatingPanel>
    )
  }

  return <UnlockPanel onNewWalletLinkClick={() => setShowNewWalletActions(true)} />
}

export default WelcomePageWithExistingWallets
