import { useQuery } from '@tanstack/react-query'

import usePowfiSdk from './usePowfiSdk'

const useFetchXAlphTokenState = () => {
  const sdk = usePowfiSdk()

  return useQuery({
    queryKey: ['xAlphTokenState', sdk.network.id],
    queryFn: () => sdk.staking.getXAlphTokenState(),
    staleTime: 60_000,
    refetchInterval: 60_000
  })
}

export default useFetchXAlphTokenState
