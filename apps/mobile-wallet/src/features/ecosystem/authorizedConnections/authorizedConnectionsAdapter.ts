import { createEntityAdapter } from '@reduxjs/toolkit'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { getAuthorizedConnectionId } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'

export const connectionsAdapter = createEntityAdapter<AuthorizedConnection>({
  selectId: getAuthorizedConnectionId,
  sortComparer: (a, b) => b.dateTime - a.dateTime
})
