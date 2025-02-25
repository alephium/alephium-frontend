import { createEntityAdapter } from '@reduxjs/toolkit'

import { SnackbarMessageInstance } from './toastMessagesTypes'

export const toastMessagesAdapter = createEntityAdapter<SnackbarMessageInstance>({
  sortComparer: (a, b) => b.id - a.id
})
