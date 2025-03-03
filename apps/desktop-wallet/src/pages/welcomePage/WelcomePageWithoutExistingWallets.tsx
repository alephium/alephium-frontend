import { useTranslation } from 'react-i18next'

import { FloatingPanel } from '@/components/PageComponents/PageContainers'
import PanelTitle from '@/components/PageComponents/PanelTitle'
import ConnectWithLedgerButton from '@/features/ledger/ConnectWithLedgerButton'
import BottomActions from '@/pages/welcomePage/BottomActions'
import NewWalletActions from '@/pages/welcomePage/NewWalletActions'

const WelcomePageWithoutExistingWallets = () => {
  const { t } = useTranslation()

  return (
    <>
      <FloatingPanel>
        <PanelTitle size="big" centerText>
          {t('Welcome.')}
        </PanelTitle>

        <NewWalletActions />
      </FloatingPanel>
      <BottomActions>
        <ConnectWithLedgerButton />
      </BottomActions>
    </>
  )
}

export default WelcomePageWithoutExistingWallets
