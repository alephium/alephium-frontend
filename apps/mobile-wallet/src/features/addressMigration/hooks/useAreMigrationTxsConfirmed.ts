import { selectSentTransactionByHash } from '@alephium/shared/store'

import { useAppSelector } from '~/hooks/redux'

const useAreMigrationTxsConfirmed = (txHashes: string[]) =>
  useAppSelector(
    (s) =>
      txHashes.length > 0 && txHashes.every((txHash) => selectSentTransactionByHash(s, txHash)?.status === 'confirmed')
  )

export default useAreMigrationTxsConfirmed
