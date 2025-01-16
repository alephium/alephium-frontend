import { createEntityAdapter } from '@reduxjs/toolkit'

import { BalanceHistory, Contact } from '@/types/addresses'

export const contactsAdapter = createEntityAdapter<Contact>({
  sortComparer: (a, b) => a.name.localeCompare(b.name)
})

export const balanceHistoryAdapter = createEntityAdapter<BalanceHistory>({
  selectId: ({ date }) => date,
  sortComparer: (a, b) => a.date.localeCompare(b.date)
})
