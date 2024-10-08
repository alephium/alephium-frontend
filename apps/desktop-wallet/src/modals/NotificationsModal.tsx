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
import WalletSwitcher from '@/components/WalletSwitcher'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'
import ModalContainer from '@/modals/ModalContainer'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

const NotificationsModal = memo(({ id }: ModalBaseProp) => {
  const { t } = useTranslation()
  const { lockWallet } = useWalletLock()
  const dispatch = useAppDispatch()

  const onClose = () => dispatch(closeModal({ id }))

  return (
    <ModalContainer id={id}>
      <NotificationsBox role="dialog" {...fadeInOutScaleFast}>
        <h2>{t('Current wallet')}</h2>
        <WalletSwitcher onUnlock={onClose} />
        <Button onClick={() => lockWallet('notifications')} wide transparent Icon={Lock}>
          {t('Lock wallet')}
        </Button>
      </NotificationsBox>
    </ModalContainer>
  )
})

export default NotificationsModal

const NotificationsBox = styled(motion.div)`
  display: flex;
  gap: 25px;
  flex-direction: column;

  position: absolute;
  left: ${walletSidebarWidthPx}px;
  top: ${appHeaderHeightPx}px;
  overflow: hidden;

  padding: 27px 19px;
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
