import { powfiSdk } from '~/api/powfi'

const useStakingContractConfig = () => {
  const { xAlphTokenAddress, xAlphTokenId } = powfiSdk.staking.getConfig()

  return {
    stakingContractAddress: xAlphTokenAddress,
    xAlphTokenId
  }
}

export default useStakingContractConfig
