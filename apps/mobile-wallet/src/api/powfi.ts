import { Powfi, type PowfiLoadParams } from '@alephium/powfi-sdk'

import { STAKING_NETWORK_OVERRIDE } from '~/constants/alephiumNetwork'
import { stakingSigner } from '~/features/staking/stakingSigner'

type PowfiNetworkId = 'mainnet' | 'testnet' | 'devnet'

const powfiSdk = STAKING_NETWORK_OVERRIDE
  ? Powfi.load({
      networkId: STAKING_NETWORK_OVERRIDE as PowfiNetworkId,
      signer: stakingSigner as unknown as NonNullable<PowfiLoadParams['signer']>
    })
  : undefined

if (powfiSdk) {
  powfiSdk.setCurrentProviders()
}

export const getPowfiSdk = () => powfiSdk

export const getRequiredPowfiSdk = () => {
  const powfi = getPowfiSdk()

  if (!powfi) {
    throw new Error('Staking network override is not configured')
  }

  return powfi
}
