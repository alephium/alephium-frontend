import { useMemo } from 'react'

import usePowfiSDK from './usePowfiSDK'

const useXAlphTokenId = () => {
  const { staking } = usePowfiSDK()

  return useMemo(() => {
    try {
      return staking.getConfig().xAlphTokenId
    } catch {
      return undefined
    }
  }, [staking])
}

export default useXAlphTokenId
