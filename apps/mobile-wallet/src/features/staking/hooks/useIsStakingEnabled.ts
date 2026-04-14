import { STAKING_NETWORK_OVERRIDE } from '~/constants/alephiumNetwork'

const useIsStakingEnabled = () => !!STAKING_NETWORK_OVERRIDE

export default useIsStakingEnabled
