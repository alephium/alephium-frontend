import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInOutBottomFast } from '@/animations'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import WalletSelect from '@/features/switch-wallet/WalletSelect'
import { useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import ModalContainer from '@/modals/ModalContainer'

const CurrentWalletModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const { lockWallet } = useWalletLock()
  const numberOfWallets = useAppSelector((s) => s.global.wallets.length)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  return (
    <ModalContainer id={id}>
      <NotificationsBox role="dialog" {...fadeInOutBottomFast}>
        <h2>{t('Current wallet')}</h2>

        {numberOfWallets === 1 ? <InfoBox text={activeWalletName} /> : <WalletSelect />}

        <Button onClick={() => lockWallet('notifications')} wide Icon={Lock} justifyContent="center">
          {t('Lock wallet')}
        </Button>
      </NotificationsBox>
    </ModalContainer>
  )
})

export default CurrentWalletModal

const NotificationsBox = styled(motion.div)`
  display: flex;
  gap: 20px;
  flex-direction: column;

  position: absolute;
  left: 10px;
  top: 80px;
  overflow: hidden;

  padding: 20px 19px;
  width: 304px;
  max-height: 95vh;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-huge);
  background-color: ${({ theme }) => theme.bg.background1};

  > * {
    margin: 0;
  }
`
