import useStakingContractConfig from './useStakingContractConfig'

const useXAlphTokenId = () => {
  const { xAlphTokenId } = useStakingContractConfig()
  return xAlphTokenId
}

export default useXAlphTokenId
