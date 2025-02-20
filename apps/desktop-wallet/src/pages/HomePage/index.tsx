import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { FloatingPanel } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import SideBarSettingsButton from '@/components/PageComponents/SideBarSettingsButton'
import { useAppSelector } from '@/hooks/redux'
import NewWalletActions from '@/pages/HomePage/NewWalletActions'
import UnlockPanel from '@/pages/HomePage/UnlockPanel'
import LockedWalletLayout from '@/pages/LockedWalletLayout'

const HomePage = () => {
  const { t } = useTranslation()
  const hasAtLeastOneWallet = useAppSelector((state) => state.global.wallets.length > 0)

  const [showNewWalletActions, setShowNewWalletActions] = useState(false)

  return (
    <LockedWalletLayout>
      {showNewWalletActions ? (
        <FloatingPanel>
          <PanelTitle centerText>{t('New wallet')}</PanelTitle>
          <NewWalletActions onExistingWalletLinkClick={() => setShowNewWalletActions(false)} />
        </FloatingPanel>
      ) : hasAtLeastOneWallet ? (
        <UnlockPanel onNewWalletLinkClick={() => setShowNewWalletActions(true)} />
      ) : (
        <FloatingPanel>
          <PanelTitle size="big" centerText>
            {t('Welcome.')}
          </PanelTitle>
          <NewWalletActions />
        </FloatingPanel>
      )}
      <SettingsButtonStyled />
    </LockedWalletLayout>
  )
}

export default HomePage

const SettingsButtonStyled = styled(SideBarSettingsButton)`
  position: absolute;
  bottom: var(--spacing-2);
  left: var(--spacing-2);
  width: auto;
`
