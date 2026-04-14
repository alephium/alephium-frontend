import { getPowfiSdk } from '~/api/powfi'

const useStakingContractConfig = () => {
  const powfi = getPowfiSdk()

  if (!powfi) {
    return { xAlphTokenAddress: '', xAlphTokenId: undefined as string | undefined }
  }

  try {
    const c = powfi.staking.getConfig()
    return {
      xAlphTokenAddress: c.xAlphTokenAddress,
      xAlphTokenId: c.xAlphTokenId
    }
  } catch {
    return { xAlphTokenAddress: '', xAlphTokenId: undefined as string | undefined }
  }
}

export default useStakingContractConfig
