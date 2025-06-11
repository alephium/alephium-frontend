import { createEntityAdapter } from '@reduxjs/toolkit'

import { DappMessage } from '~/features/ecosystem/dAppMessagesQueue/dAppMessagesQueueTypes'

export const dAppMessagesQueueAdapter = createEntityAdapter<DappMessage>({
  sortComparer: (a, b) => a.id.localeCompare(b.id)
})
