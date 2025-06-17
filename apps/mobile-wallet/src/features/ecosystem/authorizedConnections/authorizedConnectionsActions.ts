import { createAction } from '@reduxjs/toolkit'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'

export const connectionAuthorized = createAction<ConnectedAddressPayload>('authorizedConnections/connectionAuthorized')
export const connectionRemoved = createAction<AuthorizedConnection>('authorizedConnections/connectionRemoved')
export const hostConnectionRemoved = createAction<string>('authorizedConnections/hostConnectionRemoved')
export const connectionsCleared = createAction('authorizedConnections/connectionsCleared')
