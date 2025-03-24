import { ApiBalances, TokenApiBalances } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { useMemo } from 'react'

interface UseMergeAllTokensBalancesProps {
  includeAlph: boolean
  alphBalances?: ApiBalances
  tokensBalances?: TokenApiBalances[]
}

export const useMergeAllTokensBalances = ({
  includeAlph,
  alphBalances,
  tokensBalances = []
}: UseMergeAllTokensBalancesProps) =>
  useMemo(
    () =>
      includeAlph && alphBalances && alphBalances.totalBalance !== '0'
        ? [{ id: ALPH.id, ...alphBalances } as TokenApiBalances, ...tokensBalances]
        : tokensBalances,
    [includeAlph, alphBalances, tokensBalances]
  )
