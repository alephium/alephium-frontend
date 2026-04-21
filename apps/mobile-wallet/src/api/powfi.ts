import { Powfi } from '@alephium/powfi-sdk'

import { stakingSigner } from '~/features/staking/stakingSigner'

export const powfiSdk = Powfi.load({ networkId: 'testnet', signer: stakingSigner })
export const xAlphTokenId = powfiSdk.staking.getConfig().xAlphTokenId

powfiSdk.setCurrentProviders()
