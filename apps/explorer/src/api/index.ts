import { addressQueries } from '@/api/addresses/addressApi'
import { assetsQueries } from '@/api/assets/assetsApi'
import { blocksQueries } from '@/api/blocks/blocksApi'
import { infosQueries } from '@/api/infos/infosApi'
import { transactionsQueries } from '@/api/transactions/transactionsApi'

export const queries = {
  assets: assetsQueries,
  address: addressQueries,
  transactions: transactionsQueries,
  blocks: blocksQueries,
  infos: infosQueries
}
