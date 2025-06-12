import { RequestOptions } from '@alephium/wallet-dapp-provider'

import { connectionsAdapter } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsAdapter'
import { AuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsTypes'
import { matchRequestOptionsToAuthorizedConnection } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'
import { RootState } from '~/store/store'

export const { selectAll: selectAllAuthorizedConnections } = connectionsAdapter.getSelectors<RootState>(
  (state) => state.authorizedConnections
)

export const selectAuthorizedConnection = (state: RootState, requestOptions: RequestOptions) =>
  selectAllAuthorizedConnections(state).find(matchRequestOptionsToAuthorizedConnection(requestOptions))

export const selectIsConnectionAuthorized = (state: RootState, connection: AuthorizedConnection) =>
  !!selectAuthorizedConnection(state, connection)
