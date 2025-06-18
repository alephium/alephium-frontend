import { appReset, NetworkPreset } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  connectionAuthorized,
  connectionRemoved,
  connectionsCleared,
  hostConnectionRemoved
} from '~/features/ecosystem/authorizedConnections/authorizedConnectionsActions'
import { connectionsAdapter } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsAdapter'
import { selectAllAuthorizedConnections } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsSelectors'
import { getAuthorizedConnectionId } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsUtils'
import {
  loadAuthorizedConnections,
  persistAuthorizedConnections
} from '~/features/ecosystem/authorizedConnections/persistedAuthorizedConnectionsStorage'
import { RootState } from '~/store/store'

const sliceName = 'authorizedConnections'

const initialState = connectionsAdapter.getInitialState()

const authorizedConnectionsSlice = createSlice({
  name: sliceName,
  initialState: connectionsAdapter.setAll(initialState, loadAuthorizedConnections()),
  reducers: {},
  extraReducers(builder) {
    builder.addCase(connectionAuthorized, (state, action) => {
      const connection = {
        dateTime: new Date().getTime(),
        host: action.payload.host,
        address: action.payload.address,
        networkName: action.payload.network.id as NetworkPreset,
        icon: action.payload.icon
      }
      connectionsAdapter.addOne(state, connection)
    })
    builder.addCase(connectionRemoved, (state, action) => {
      connectionsAdapter.removeOne(state, getAuthorizedConnectionId(action.payload))
    })
    builder.addCase(hostConnectionRemoved, (state, action) => {
      const ids = state.ids.filter((id) => id.toString().startsWith(action.payload))
      connectionsAdapter.removeMany(state, ids)
    })
    builder.addCase(connectionsCleared, (state) => {
      connectionsAdapter.removeAll(state)
    })
    builder.addCase(appReset, () => initialState)
  }
})

// Listener middleware for persistence
export const authorizedConnectionsListenerMiddleware = createListenerMiddleware()

authorizedConnectionsListenerMiddleware.startListening({
  matcher: isAnyOf(connectionAuthorized, connectionRemoved, connectionsCleared, appReset),
  effect: async (_, { getState }) =>
    persistAuthorizedConnections(selectAllAuthorizedConnections(getState() as RootState))
})

export default authorizedConnectionsSlice
