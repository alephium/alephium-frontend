import { useMemo } from 'react'

import usePowfiSDK from './usePowfiSDK'

const useStakingContractConfig = () => {
  const { staking } = usePowfiSDK()

  return useMemo(() => {
    try {
      const c = staking.getConfig()
      return {
        xAlphTokenAddress: c.xAlphTokenAddress,
        xAlphTokenId: c.xAlphTokenId
      }
    } catch {
      return { xAlphTokenAddress: '', xAlphTokenId: undefined as string | undefined }
    }
  }, [staking])
}

export default useStakingContractConfig
