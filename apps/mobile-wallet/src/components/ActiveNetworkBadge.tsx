import { NetworkStatus } from '@alephium/shared'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'

const ActiveNetworkBadge = () => {
  const networkStatus = useAppSelector((s) => s.network.status)
  const networkName = useAppSelector((s) => s.network.name)

  return (
    <ActiveNetworkContainer>
      <NetworkStatusBullet status={networkStatus} />
      <AppText color="primary">{networkName}</AppText>
    </ActiveNetworkContainer>
  )
}

export default ActiveNetworkBadge

const ActiveNetworkContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 5px;
  border-radius: 33px;
  padding: 4px 10px;
  background-color: ${({ theme }) => theme.bg.primary};
`

const NetworkStatusBullet = styled.View<{ status: NetworkStatus }>`
  height: 7px;
  width: 7px;
  border-radius: 10px;
  background-color: ${({ status, theme }) => (status === 'online' ? theme.global.valid : theme.global.alert)};
`
