import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppSelector } from '~/hooks/redux'

const WalletConnectErrorModal = memo<ModalBaseProp>(() => {
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()
  const walletConnectClientError = useAppSelector((s) => s.clients.walletConnect.errorMessage)
  const { resetWalletConnectClientInitializationAttempts } = useWalletConnectContext()

  return (
    <BottomModal2 notScrollable contentVerticalGap>
      <ScreenSection>
        <ModalScreenTitle>{t('Could not connect to WalletConnect')}</ModalScreenTitle>
      </ScreenSection>
      {walletConnectClientError && (
        <ScreenSection>
          <Surface>
            <AppTextStyled>{walletConnectClientError}</AppTextStyled>
          </Surface>
        </ScreenSection>
      )}
      <ScreenSection centered>
        <ButtonsRow>
          <Button title={t('Close')} onPress={dismissModal} flex />
          <Button
            title={t('Retry')}
            variant="accent"
            onPress={() => {
              resetWalletConnectClientInitializationAttempts()
              dismissModal()
            }}
            flex
          />
        </ButtonsRow>
      </ScreenSection>
    </BottomModal2>
  )
})

export default WalletConnectErrorModal

const AppTextStyled = styled(AppText)`
  font-family: monospace;
  padding: 10px;
`
