import { selectSentTransactionByHash } from '@alephium/shared/store'

import { useAppSelector } from '~/hooks/redux'

const useConfirmedMigrationTxsCount = (txHashes: string[]) =>
  useAppSelector(
    (s) => txHashes.filter((txHash) => selectSentTransactionByHash(s, txHash)?.status === 'confirmed').length
  )

export default useConfirmedMigrationTxsCount
