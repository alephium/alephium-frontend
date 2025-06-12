import { RequestOptions } from '@alephium/wallet-dapp-provider'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { matchRequestOptionsToAuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'
import { storage } from '~/persistent-storage/storage'

export const STORAGE_KEY = 'alephium-dapp-authorized-connections'

export const loadAuthorizedConnections = () => {
  const storedConnections = storage.getString(STORAGE_KEY)

  if (!storedConnections) return []

  try {
    return JSON.parse(storedConnections) as AuthorizedConnection[]
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
