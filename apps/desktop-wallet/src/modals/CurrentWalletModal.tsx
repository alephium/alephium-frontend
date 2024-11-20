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

import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInOutScaleFast } from '@/animations'
import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import WalletSelect from '@/features/switch-wallet/WalletSelect'
import { useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import ModalContainer from '@/modals/ModalContainer'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

const CurrentWalletModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const { lockWallet } = useWalletLock()
  const numberOfWallets = useAppSelector((s) => s.global.wallets.length)
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  return (
    <ModalContainer id={id}>
      <NotificationsBox role="dialog" {...fadeInOutScaleFast}>
        <h2>{t('Current wallet')}</h2>

        {numberOfWallets === 1 ? <InfoBox text={activeWalletName} /> : <WalletSelect />}

        <Button onClick={() => lockWallet('notifications')} wide transparent Icon={Lock}>
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
  left: ${walletSidebarWidthPx}px;
  top: ${appHeaderHeightPx}px;
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
