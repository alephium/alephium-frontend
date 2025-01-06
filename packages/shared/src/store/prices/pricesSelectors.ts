import { tokenPricesAdapter, tokenPricesHistoryAdapter } from '@/store/prices/pricesAdapter'
import { SharedRootState } from '@/store/store'

export const { selectAll: selectAllPrices, selectById: selectPriceById } =
  tokenPricesAdapter.getSelectors<SharedRootState>((state) => state.tokenPrices)

export const { selectAll: selectAllPricesHistories, selectById: selectPriceHistoryById } =
  tokenPricesHistoryAdapter.getSelectors<SharedRootState>((state) => state.tokenPricesHistory)
