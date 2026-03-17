import { getNetworkNameFromNetworkId } from '@alephium/shared'

import { useAppSelector } from '~/hooks/redux'

const useIsStakingEnabled = () => {
  const networkId = useAppSelector((s) => s.network.settings.networkId)

  return getNetworkNameFromNetworkId(networkId) === 'testnet'
}

export default useIsStakingEnabled
