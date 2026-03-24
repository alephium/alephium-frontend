import { useQuery } from '@tanstack/react-query'

import usePowfiSDK from './usePowfiSDK'

const useFetchXAlphTokenState = () => {
  const { staking, network } = usePowfiSDK()

  return useQuery({
    queryKey: ['xAlphTokenState', network.id],
    queryFn: () => staking.getXAlphTokenState(),
    staleTime: 60_000,
    refetchInterval: 60_000
  })
}

export default useFetchXAlphTokenState
