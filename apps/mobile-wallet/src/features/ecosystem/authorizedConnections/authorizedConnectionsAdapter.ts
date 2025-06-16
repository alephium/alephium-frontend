import { createEntityAdapter } from '@reduxjs/toolkit'

import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'

export const connectionsAdapter = createEntityAdapter<AuthorizedConnection>({
  selectId: (connection) => connection.host,
  sortComparer: (a, b) => b.dateTime - a.dateTime
})
