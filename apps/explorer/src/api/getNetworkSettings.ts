/* eslint-disable @typescript-eslint/no-explicit-any */

import { NetworkNames, NetworkPreset } from '@alephium/shared'

export const getNetworkSettings = () => {
  let explorerUrl: string | null | undefined = (window as any).VITE_BACKEND_URL
  let nodeUrl: string | null | undefined = (window as any).VITE_NODE_URL

  let netType = (window as any).VITE_NETWORK_TYPE

  if (!explorerUrl || !nodeUrl) {
    explorerUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9090'
    nodeUrl = import.meta.env.VITE_NODE_URL || 'http://localhost:12973'
    netType = import.meta.env.VITE_NETWORK_TYPE || 'testnet'

    console.info(`
        • DEVELOPMENT MODE •

        Using local env. variables if available.
        You can set them using a .env file placed at the project's root.

        - Backend URL: ${explorerUrl}
        - Node URL: ${nodeUrl}
        - Network Type: ${netType}
      `)
  }

  if (!explorerUrl) {
    throw new Error('The VITE_BACKEND_URL environment variable must be defined')
  }

  if (!nodeUrl) {
    throw new Error('The VITE_NODE_URL environment variable must be defined')
  }

  if (!netType) {
    throw new Error('The VITE_NETWORK_TYPE environment variable must be defined')
  } else if (netType === 'custom' || !NetworkNames[netType as NetworkPreset]) {
    throw new Error('Value of the VITE_NETWORK_TYPE environment variable is invalid')
  }

  return {
    explorerUrl,
    nodeUrl,
    netType
  }
}
