import { useMemo } from 'react'

import usePowfiSdk from './usePowfiSdk'

const useXAlphTokenId = () => {
  const sdk = usePowfiSdk()

  return useMemo(() => {
    try {
      return sdk.staking.getConfig().xAlphTokenId
    } catch {
      return undefined
    }
  }, [sdk])
}

export default useXAlphTokenId
