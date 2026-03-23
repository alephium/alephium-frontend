import { Powfi } from '@alephium/powfi-sdk'
import type { NetworkSettings } from '@alephium/shared'

type PowfiNetworkId = 'mainnet' | 'testnet' | 'devnet'

type Endpoints = Pick<NetworkSettings, 'explorerApiHost' | 'nodeHost'>

let instance: ReturnType<typeof Powfi.load> | undefined
let instanceKey: string | undefined

/**
 * Several staking hooks share one Powfi instance for the same network + URLs (otherwise each hook’s useMemo would
 * allocate a separate SDK). Still uses the wallet’s node/explorer hosts, not Powfi defaults.
 */
export const getPowfiSdk = (networkId: PowfiNetworkId, endpoints: Endpoints) => {
  const key = `${networkId}|${endpoints.nodeHost}|${endpoints.explorerApiHost}`
  if (instance && instanceKey === key) return instance

  instance = Powfi.load({
    networkId,
    networkOverrides: {
      nodeUrl: endpoints.nodeHost,
      explorerApiUrl: endpoints.explorerApiHost
    }
  })
  instanceKey = key
  return instance
}

export const networkIdToSdkNetworkId = (networkId: number): PowfiNetworkId => {
  switch (networkId) {
    case 0:
      return 'mainnet'
    case 1:
      return 'testnet'
    case 4:
      return 'devnet'
    default:
      return 'mainnet'
  }
}
