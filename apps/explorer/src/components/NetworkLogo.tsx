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

import styled from 'styled-components'

import { NetworkType } from '@/types/network'

interface NetworkLogoProps {
  network: NetworkType
  size?: number
}

const NetworkLogo = ({ network, size = 25 }: NetworkLogoProps) => (
  <LogoContainer network={network} size={size}>
    {network === 'mainnet' ? 'M' : 'T'}
  </LogoContainer>
)

const LogoContainer = styled.div<NetworkLogoProps>`
  height: ${({ size }) => size}px;
  width: ${({ size }) => size}px;
  border-radius: 20%;
  background: ${({ network, theme }) => (network === 'mainnet' ? theme.global.highlightGradient : theme.bg.secondary)};
  color: ${({ network, theme }) => (network === 'mainnet' ? 'rgba(255, 255, 255, 0.8)' : theme.font.primary)};
  border: 1px solid ${({ theme }) => theme.border.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
`

export default NetworkLogo
