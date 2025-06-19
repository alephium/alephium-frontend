import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'

const ConnectTipModal = memo(() => {
  const { t } = useTranslation()

  return (
    <BottomModal2 notScrollable contentVerticalGap>
      <ScreenSection>
        <ModalScreenTitle>{t('Useful tip')} 💡</ModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <AppText color="secondary" size={18}>
          <Trans
            t={t}
            i18nKey="connectTipModalMessage"
            components={{
              1: <AppText size={18} bold />
            }}
          >
            {
              'For a smoother experience when connecting to a dApp, use the <1>Browser/Extension</1> button instead of WalletConnect.'
            }
          </Trans>
        </AppText>
      </ScreenSection>
    </BottomModal2>
  )
})

export default ConnectTipModal
