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
import { AnimatePresence, motion } from 'framer-motion'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { getInitials, onEnterOrSpace } from '@/utils/misc'

const walletNameAppearAfterSeconds = 1
const walletNameHideAfterSeconds = 4

const WalletNameButton = () => {
  const dispatch = useAppDispatch()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)
  const [fullWalletNameVisible, setFullWalletNameVisible] = useState(true)

  useEffect(() => {
    if (!fullWalletNameVisible) return

    const timeoutId = setTimeout(
      () => setFullWalletNameVisible(false),
      (walletNameHideAfterSeconds - walletNameAppearAfterSeconds) * 1000
    )

    return () => clearTimeout(timeoutId)
  }, [fullWalletNameVisible])

  if (!activeWalletName) return null

  const activeWalletNameInitials = getInitials(activeWalletName)
  const openCurrentWalletModal = () => dispatch(openModal({ name: 'CurrentWalletModal' }))

  return (
    <>
      <AnimatePresence>
        {fullWalletNameVisible && (
          <OnEnterWalletName
            initial={{ x: 80, opacity: 0, scaleX: 1 }}
            animate={{ x: 100, opacity: 1, scaleX: 1 }}
            exit={{ x: -50, opacity: 0, scaleX: 0.5 }}
            transition={{
              type: 'spring',
              stiffness: 700,
              damping: 70,
              delay: walletNameAppearAfterSeconds
            }}
          >
            👋 {t('Wallet')}: {activeWalletName}
          </OnEnterWalletName>
        )}
      </AnimatePresence>
      <CurrentWalletInitials
        onClick={openCurrentWalletModal}
        onKeyDown={(e) => onEnterOrSpace(e, openCurrentWalletModal)}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: walletNameHideAfterSeconds, type: 'spring', stiffness: 500, damping: 70 }}
        key={`initials-${activeWalletName}`}
        role="button"
        tabIndex={0}
      >
        <AnimatePresence mode="wait">
          <WalletInitialsContainer
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ type: 'spring', stiffness: 500, damping: 70 }}
          >
            {activeWalletNameInitials}
          </WalletInitialsContainer>
        </AnimatePresence>
      </CurrentWalletInitials>
    </>
  )
}

export default WalletNameButton

const CurrentWalletInitials = styled(motion.div)`
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--fontWeight-semiBold);
  background-color: ${({ theme }) => theme.bg.primary};
  overflow: hidden;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const OnEnterWalletName = styled(CurrentWalletInitials)`
  position: absolute;
  left: 20px;
  width: auto;
  border-radius: 100px;
  white-space: nowrap;
  padding: 20px;
  font-size: 15px;
  pointer-events: none;
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  border: 2px solid ${({ theme }) => theme.global.accent};
`

const WalletInitialsContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
`
