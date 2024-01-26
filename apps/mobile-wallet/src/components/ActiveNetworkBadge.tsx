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

import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'
import { NetworkStatus } from '~/types/network'

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
