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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 700,
              damping: 70,
              delay: walletNameAppearAfterSeconds
            }}
          >
            {activeWalletName}
          </OnEnterWalletName>
        )}
      </AnimatePresence>
      <CurrentWalletInitials
        onClick={openCurrentWalletModal}
        onKeyDown={(e) => onEnterOrSpace(e, openCurrentWalletModal)}
        key={`initials-${activeWalletName}`}
        role="button"
        tabIndex={0}
      >
        <WalletInitialsContainer>{activeWalletNameInitials}</WalletInitialsContainer>
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
  background-color: ${({ theme }) => theme.bg.background1};
  overflow: hidden;
  z-index: 1;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const OnEnterWalletName = styled(CurrentWalletInitials)`
  position: absolute;
  left: 12px;
  height: 56px;
  padding-left: 60px;
  padding-right: 20px;
  bottom: 11px;
  width: auto;
  border-radius: 100px;
  white-space: nowrap;
  font-size: 14px;
  pointer-events: none;
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  border: 2px solid ${({ theme }) => theme.global.accent};
  display: flex;
  align-items: center;
`

const WalletInitialsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
