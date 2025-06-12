import { dAppMessagesQueueAdapter } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueAdapter'
import { RootState } from '~/store/store'

const { selectAll: selectAllDappMessages } = dAppMessagesQueueAdapter.getSelectors<RootState>(
  (state) => state.dAppMessagesQueue
)

export const selectCurrentlyProcessingDappMessage = (state: RootState) => selectAllDappMessages(state).at(0)
