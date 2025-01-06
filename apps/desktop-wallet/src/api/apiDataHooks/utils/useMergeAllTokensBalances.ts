import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

import { ApiBalances, TokenApiBalances } from '@/types/tokens'

interface UseMergeAllTokensBalancesProps {
  includeAlph: boolean
  alphBalances?: ApiBalances
  tokensBalances?: TokenApiBalances[]
}

const useMergeAllTokensBalances = ({
  includeAlph,
  alphBalances,
  tokensBalances = []
}: UseMergeAllTokensBalancesProps) =>
  useMemo(
    () =>
      includeAlph && alphBalances?.totalBalance
        ? [{ id: ALPH.id, ...alphBalances }, ...tokensBalances]
        : tokensBalances,
    [includeAlph, alphBalances, tokensBalances]
  )

export default useMergeAllTokensBalances
