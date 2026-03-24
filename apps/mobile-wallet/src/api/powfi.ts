import { Powfi, type PowfiLoadParams } from '@alephium/powfi-sdk'
import type { NetworkSettings } from '@alephium/shared'

import { stakingSigner } from '~/features/staking/stakingSigner'

type PowfiNetworkId = 'mainnet' | 'testnet' | 'devnet'

type Endpoints = Pick<NetworkSettings, 'explorerApiHost' | 'nodeHost'>

let instance: ReturnType<typeof Powfi.load> | undefined
let instanceKey: string | undefined

/**
 * Single Powfi SDK instance per (logical network + node + explorer). Signer is fixed at load time; staking txs use the
 * signer’s selected account from the wallet store, not `powfi.account`.
 */
export const getPowfiSdk = (networkId: PowfiNetworkId, endpoints: Endpoints) => {
  const key = `${networkId}|${endpoints.nodeHost}|${endpoints.explorerApiHost}`
  if (instance && instanceKey === key) return instance

  instance = Powfi.load({
    networkId,
    networkOverrides: {
      nodeUrl: endpoints.nodeHost,
      explorerApiUrl: endpoints.explorerApiHost
    },
    signer: stakingSigner as unknown as NonNullable<PowfiLoadParams['signer']>
  })
  instance.setCurrentProviders()
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
