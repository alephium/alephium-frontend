import { Powfi, type PowfiLoadParams } from '@alephium/powfi-sdk'
import { getNetworkNameFromNetworkId, type NetworkPreset } from '@alephium/shared'

import { stakingSigner } from '~/features/staking/stakingSigner'
import { store } from '~/store/store'

// Set manually in dev to test staking on another network after switching the wallet network in-app to the same value.
export const _stakingNetworkOverride: NetworkPreset | undefined = undefined

let powfiSdk: ReturnType<typeof Powfi.load> | undefined

export const getStakingNetworkId = (): NetworkPreset => _stakingNetworkOverride ?? 'mainnet'

const isStakingNetworkActive = () =>
  getNetworkNameFromNetworkId(store.getState().network.settings.networkId) === getStakingNetworkId()

export const getPowfiSdk = () => {
  if (!isStakingNetworkActive()) return undefined
  if (powfiSdk) return powfiSdk

  powfiSdk = Powfi.load({
    networkId: getStakingNetworkId(),
    signer: stakingSigner as unknown as NonNullable<PowfiLoadParams['signer']>
  })
  powfiSdk.setCurrentProviders()

  return powfiSdk
}

export const getRequiredPowfiSdk = () => {
  const powfi = getPowfiSdk()

  if (!powfi) {
    throw new Error('Staking is not available on the current network')
  }

  return powfi
}
