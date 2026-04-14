import { useQuery } from '@tanstack/react-query'

import { powfiSdk } from '~/api/powfi'

const useFetchXAlphTokenState = () =>
  useQuery({
    queryKey: ['x-alph-token-state'],
    queryFn: () => powfiSdk.staking.getXAlphTokenState(),
    staleTime: 60_000,
    refetchInterval: 60_000
  })

export default useFetchXAlphTokenState
