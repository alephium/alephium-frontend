import { useActivityIndicator } from '@alephium/shared-react'
import { useLocation } from 'react-router-dom'
import styled from 'styled-components'

import { sidebarExpandThresholdPx } from '@/style/globalStyles'

// Our infinite query that fetches the wallet transactions is set up to delete the persisted cache after 5 minutes, so
// that we are not bloating the cache when addresses are being deleted/created. However, since this query was only
// used in the Activity page, when the user navigates to other pages for longer than 5 minutes, the cache will again
// be deleted. By keeping an active instance of the infinite query (and using it to display an activity indicator), we
// ensure that when addresses are deleted/created the old cache will be deleted after 5 minutes but the latest wallet
// transactions will be always be persisted, leading to a better UX.
const ActivityIndicator = () => {
  const isOnActivityPage = useLocation().pathname === '/wallet/activity'
  const newTxCountIndicator = useActivityIndicator({ isDisabled: isOnActivityPage })

  if (newTxCountIndicator === 0 || isOnActivityPage) return null

  return <ActivityIndicatorStyled>{newTxCountIndicator}</ActivityIndicatorStyled>
}

export default ActivityIndicator

const ActivityIndicatorStyled = styled.div`
  position: absolute;
  right: -5px;
  top: -5px;
  background-color: ${({ theme }) => theme.global.accent};
  padding: 2px 5px;
  border-radius: var(--radius-small);
  font-size: 10px;

  @media (min-width: ${sidebarExpandThresholdPx}px) {
    right: 20px;
    top: 50%;
    transform: translate(50%, -50%);
  }
`
