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

import { NetworkPreset, networkSettingsPresets } from '@alephium/shared'
import { ComponentPropsWithoutRef } from 'react'
import styled from 'styled-components'

import client from '@/api/client'
import Menu from '@/components/Menu'
import NetworkLogo from '@/components/NetworkLogo'

const networkLabels = {
  mainnet: 'Mainnet',
  testnet: 'Testnet',
  devnet: 'Devnet'
}

const NetworkSwitch = ({
  direction = 'down',
  className
}: Pick<ComponentPropsWithoutRef<typeof Menu>, 'direction' | 'className'>) => (
  <Menu
    aria-label="Selected network"
    label={networkLabels[client.networkType]}
    icon={<NetworkLogo network={client.networkType} />}
    items={[
      {
        text: 'Mainnet',
        onClick: () => switchToNetwork('mainnet'),
        icon: <NetworkLogo network="mainnet" />
      },
      {
        text: 'Testnet',
        onClick: () => switchToNetwork('testnet'),
        icon: <NetworkLogo network="testnet" />
      }
    ]}
    direction={direction}
    className={className}
  />
)

export default styled(NetworkSwitch)`
  border-radius: 8px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const switchToNetwork = (network: NetworkPreset) => {
  if (client.networkType !== network) {
    window.location.assign(networkSettingsPresets[network].explorerUrl)
  }
}
