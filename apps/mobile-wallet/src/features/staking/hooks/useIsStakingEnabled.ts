import { getNetworkNameFromNetworkId } from '@alephium/shared'

import { getStakingNetworkId } from '~/api/powfi'
import { useAppSelector } from '~/hooks/redux'

const useIsStakingEnabled = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  return getNetworkNameFromNetworkId(networkId) === getStakingNetworkId()
}

export default useIsStakingEnabled
