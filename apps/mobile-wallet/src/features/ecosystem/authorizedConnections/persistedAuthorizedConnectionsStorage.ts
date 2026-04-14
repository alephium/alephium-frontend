import { ONE_WEEK_MS } from '@alephium/shared'
import { RequestOptions } from '@alephium/wallet-dapp-provider'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { matchRequestOptionsToAuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'
import { storage } from '~/persistent-storage/storage'

export const STORAGE_KEY = 'alephium-dapp-authorized-connections'

// TODO: Share with extension wallet
const CONNECTION_EXPIRY = ONE_WEEK_MS

export const loadAuthorizedConnections = () => {
  const storedConnections = storage.getString(STORAGE_KEY)

  if (!storedConnections) return []

  try {
    const connections = JSON.parse(storedConnections) as AuthorizedConnection[]

    const validConnections = connections.filter((connection) => connection.dateTime > Date.now() - CONNECTION_EXPIRY)

    if (validConnections.length !== connections.length) {
      persistAuthorizedConnections(validConnections)
    }

    return validConnections
  } catch (error) {
    console.error('Failed to parse stored connections:', error)
    return []
  }
}

export const persistAuthorizedConnections = (connections: AuthorizedConnection[]) => {
  storage.set(STORAGE_KEY, JSON.stringify(connections))
}

export const getAuthorizedConnection = (requestOptions: RequestOptions): AuthorizedConnection | undefined =>
  loadAuthorizedConnections().find(matchRequestOptionsToAuthorizedConnection(requestOptions))

export const isConnectionAuthorized = (requestOptions: RequestOptions): boolean =>
  !!getAuthorizedConnection(requestOptions)
