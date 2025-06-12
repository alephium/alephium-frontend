import { NetworkName } from '@/types/network'

export const getNetworkIdFromNetworkName = (networkName?: NetworkName) => {
  switch (networkName) {
    case 'mainnet':
      return 0
    case 'testnet':
      return 1
    case 'devnet':
      return 4
    default:
      return undefined
  }
}

export const getNetworkNameFromNetworkId = (networkId?: number) => {
  switch (networkId) {
    case 0:
      return 'mainnet'
    case 1:
      return 'testnet'
    case 4:
      return 'devnet'
    default:
      return undefined
  }
}
