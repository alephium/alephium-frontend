import { connectionsAdapter } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsAdapter'
import { RootState } from '~/store/store'

export const { selectAll: selectAllAuthorizedConnections } = connectionsAdapter.getSelectors<RootState>(
  (state) => state.authorizedConnections
)
