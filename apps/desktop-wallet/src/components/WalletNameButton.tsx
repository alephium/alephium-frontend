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

const WalletNameButtonStyled = styled.div`
  flex: 1;
  border-radius: var(--radius-medium);
  display: flex;
  align-items: center;
  padding: 6px;

  overflow: hidden;
  z-index: 1;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.primary};
  }
`

const WalletNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
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
  color: ${({ theme }) => theme.font.contrastPrimary};
  height: 30px;
  width: 30px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.global.complementary};
`
