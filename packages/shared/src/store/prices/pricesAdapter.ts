import { createEntityAdapter } from '@reduxjs/toolkit'

import { TokenPriceEntity } from '@/types/price'

export const tokenPricesAdapter = createEntityAdapter<TokenPriceEntity>({
  selectId: (token) => token.symbol,
  sortComparer: (a, b) => a.symbol.localeCompare(b.symbol)
})
