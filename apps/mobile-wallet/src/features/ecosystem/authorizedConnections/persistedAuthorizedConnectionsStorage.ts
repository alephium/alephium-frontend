import { ONE_WEEK_MS } from '@alephium/shared'
import { RequestOptions } from '@alephium/wallet-dapp-provider'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { matchRequestOptionsToAuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'
import { storage } from '~/persistent-storage/storage'

const authorizedConnectionsKey = (walletId: string) => `authorized-connections-${walletId}`

// Legacy key used only by multi-wallet migration
export const LEGACY_AUTHORIZED_CONNECTIONS_KEY = 'alephium-dapp-authorized-connections'

// TODO: Share with extension wallet
const CONNECTION_EXPIRY = ONE_WEEK_MS

export const loadAuthorizedConnections = (walletId: string) => {
  const storedConnections = storage.getString(authorizedConnectionsKey(walletId))

  if (!storedConnections) return []

  try {
    const connections = JSON.parse(storedConnections) as AuthorizedConnection[]

    const validConnections = connections.filter((connection) => connection.dateTime > Date.now() - CONNECTION_EXPIRY)

    if (validConnections.length !== connections.length) {
      persistAuthorizedConnections(walletId, validConnections)
    }

    return validConnections
  } catch (error) {
    console.error('Failed to parse stored connections:', error)
    return []
  }
}

export const persistAuthorizedConnections = (walletId: string, connections: AuthorizedConnection[]) => {
  storage.set(authorizedConnectionsKey(walletId), JSON.stringify(connections))
}

export const getAuthorizedConnection = (
  walletId: string,
  requestOptions: RequestOptions
): AuthorizedConnection | undefined =>
  loadAuthorizedConnections(walletId).find(matchRequestOptionsToAuthorizedConnection(requestOptions))

export const isConnectionAuthorized = (walletId: string, requestOptions: RequestOptions): boolean =>
  !!getAuthorizedConnection(walletId, requestOptions)
