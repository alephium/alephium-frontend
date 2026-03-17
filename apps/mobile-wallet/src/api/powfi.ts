import { Powfi } from '@alephium/powfi-sdk'

type PowfiNetworkId = 'mainnet' | 'testnet' | 'devnet'

const sdkCache = new Map<PowfiNetworkId, ReturnType<typeof Powfi.load>>()

export const getPowfiSdk = (networkId: PowfiNetworkId) => {
  const cached = sdkCache.get(networkId)
  if (cached) return cached

  const sdk = Powfi.load({ networkId })
  sdkCache.set(networkId, sdk)

  return sdk
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
