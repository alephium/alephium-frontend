import { XAlphTokenTypes } from '@alephium/powfi-sdk'
import { useQuery } from '@tanstack/react-query'

import { powfiSdk } from '~/api/powfi'
import { PersistedBigInts } from '~/features/staking/stakingUtils'

type PersistedXAlphTokenState = Omit<XAlphTokenTypes.State, 'fields'> & {
  fields: PersistedBigInts<XAlphTokenTypes.Fields>
}

const useFetchXAlphTokenState = () => {
  const { data, isLoading } = useQuery<PersistedXAlphTokenState, Error, XAlphTokenTypes.State>({
    queryKey: ['x-alph-token-state'],
    queryFn: () => powfiSdk.staking.getXAlphTokenState(),
    select: toXAlphTokenState,
    staleTime: 60_000,
    refetchInterval: 60_000
  })

  return {
    data,
    isLoading
  }
}

export default useFetchXAlphTokenState

const toXAlphTokenState = (state: PersistedXAlphTokenState): XAlphTokenTypes.State => ({
  ...state,
  fields: {
    ...state.fields,
    decimals: BigInt(state.fields.decimals),
    maxActiveUnstakeRequestsPerUser: BigInt(state.fields.maxActiveUnstakeRequestsPerUser),
    unstakeDuration: BigInt(state.fields.unstakeDuration),
    totalDepositedAlph: BigInt(state.fields.totalDepositedAlph),
    totalXAlphSupply: BigInt(state.fields.totalXAlphSupply),
    lastUnstakeVaultIndex: BigInt(state.fields.lastUnstakeVaultIndex)
  }
})
