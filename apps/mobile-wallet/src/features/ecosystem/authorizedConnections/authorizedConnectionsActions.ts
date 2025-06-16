import { createAction } from '@reduxjs/toolkit'

import { ConnectedAddressPayload } from '~/features/ecosystem/dAppMessaging/dAppMessagingTypes'

export const connectionAuthorized = createAction<ConnectedAddressPayload>('authorizedConnections/connectionAuthorized')
export const connectionRemoved = createAction<string>('authorizedConnections/connectionRemoved')
export const connectionsCleared = createAction('authorizedConnections/connectionsCleared')
