import { appReset } from '@alephium/shared'
import { createSlice } from '@reduxjs/toolkit'

import {
  dAppMessagesQueueCleared,
  receivedDappMessage,
  respondedToDappMessage
} from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueActions'
import { dAppMessagesQueueAdapter } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueAdapter'

const sliceName = 'dAppMessagesQueue'

const initialState = dAppMessagesQueueAdapter.getInitialState()

const dAppMessagesQueueSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(receivedDappMessage, (state, action) => {
      dAppMessagesQueueAdapter.addOne(state, {
        id: new Date().getTime().toString(),
        ...action.payload
      })
    })
    builder.addCase(respondedToDappMessage, (state, action) => {
      dAppMessagesQueueAdapter.removeOne(state, action.payload)
    })
    builder.addCase(dAppMessagesQueueCleared, () => initialState)
    builder.addCase(appReset, () => initialState)
  }
})

export default dAppMessagesQueueSlice
