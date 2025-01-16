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
