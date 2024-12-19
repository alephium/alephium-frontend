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
import styled from 'styled-components'

import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { sidebarExpandThresholdPx } from '@/style/globalStyles'
import { getInitials, onEnterOrSpace } from '@/utils/misc'

const WalletNameButton = () => {
  const dispatch = useAppDispatch()
  const activeWalletName = useAppSelector((s) => s.activeWallet.name)

  if (!activeWalletName) return null

  const openCurrentWalletModal = () => dispatch(openModal({ name: 'CurrentWalletModal' }))

  return (
    <WalletNameButtonStyled
      onClick={openCurrentWalletModal}
      onKeyDown={(e) => onEnterOrSpace(e, openCurrentWalletModal)}
      key={`initials-${activeWalletName}`}
      role="button"
      tabIndex={0}
    >
      <WalletNameContainer>
        <Initials>{getInitials(activeWalletName)}</Initials>
        <Name>{activeWalletName}</Name>
      </WalletNameContainer>
    </WalletNameButtonStyled>
  )
}

export default WalletNameButton

const WalletNameButtonStyled = styled(motion.div)`
  flex: 1;
  height: var(--inputHeight);
  border-radius: var(--radius-big);
  display: flex;
  align-items: center;
  padding: 6px;
  font-weight: var(--fontWeight-semiBold);
  overflow: hidden;
  z-index: 1;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const WalletNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const Name = styled.span`
  flex: 1;
  text-align: center;
  @media (max-width: ${sidebarExpandThresholdPx}px) {
    display: none;
  }
`

const Initials = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.primary};
  height: 36px;
  width: 36px;
  border-radius: 100px;
  border: 1px solid ${({ theme }) => theme.border.primary};
`
