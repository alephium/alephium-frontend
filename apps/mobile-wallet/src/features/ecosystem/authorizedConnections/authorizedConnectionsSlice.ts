import { appReset, NetworkPreset } from '@alephium/shared'
import { createListenerMiddleware, createSlice, isAnyOf } from '@reduxjs/toolkit'

import {
  connectionAuthorized,
  connectionRemoved,
  connectionsCleared
} from '~/features/ecosystem/authorizedConnections/authorizedConnectionsActions'
import { connectionsAdapter } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsAdapter'
import { selectAllAuthorizedConnections } from '~/features/ecosystem/authorizedConnections/authorizedConnectionsSelectors'
import {
  loadAuthorizedConnections,
  persistAuthorizedConnections
} from '~/features/ecosystem/authorizedConnections/persistedAuthorizedConnectionsStorage'
import { RootState } from '~/store/store'

const sliceName = 'authorizedConnections'

// TODO: CONNECTION_EXPIRY (see extension wallet, should expire after 7 days)

const initialState = connectionsAdapter.getInitialState()
connectionsAdapter.setAll(initialState, loadAuthorizedConnections())

const authorizedConnectionsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(connectionAuthorized, (state, action) => {
      const connection = {
        dateTime: new Date().getTime(),
        host: action.payload.host,
        address: action.payload.address,
        networkName: action.payload.network.id as NetworkPreset
      }
      connectionsAdapter.addOne(state, connection)
    })
    builder.addCase(connectionRemoved, (state, action) => {
      connectionsAdapter.removeOne(state, action.payload)
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
