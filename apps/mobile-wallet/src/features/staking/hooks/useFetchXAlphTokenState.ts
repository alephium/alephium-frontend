import { useQuery } from '@tanstack/react-query'

import { getPowfiSdk } from '~/api/powfi'

const useFetchXAlphTokenState = () => {
  const powfi = getPowfiSdk()

  return useQuery({
    queryKey: ['xAlphTokenState', powfi?.network.id],
    queryFn: () => powfi!.staking.getXAlphTokenState(),
    enabled: !!powfi,
    staleTime: 60_000,
    refetchInterval: 60_000
  })
}

export default useFetchXAlphTokenState
