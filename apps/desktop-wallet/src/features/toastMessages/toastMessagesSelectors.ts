import { toastMessagesAdapter } from '@/features/toastMessages/toastMessagesAdapter'
import { RootState } from '@/storage/store'

export const { selectAll: selectAllToastMessages } = toastMessagesAdapter.getSelectors<RootState>(
  (state) => state.toastMessages
)
