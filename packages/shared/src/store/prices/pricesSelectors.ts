import { tokenPricesAdapter } from '@/store/prices/pricesAdapter'
import { SharedRootState } from '@/store/store'

export const { selectAll: selectAllPrices, selectById: selectPriceById } =
  tokenPricesAdapter.getSelectors<SharedRootState>((state) => state.tokenPrices)
