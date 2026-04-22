import type { App } from '@alephium/powfi-backend'
import { Powfi } from '@alephium/powfi-sdk'
import { treaty } from '@elysiajs/eden'

import { stakingSigner } from '~/features/staking/stakingSigner'

export const powfiSdk = Powfi.load({ networkId: 'testnet', signer: stakingSigner })
export const powfiBackend = treaty<App>(process.env.EXPO_PUBLIC_POWFI_BACKEND_HOST || 'http://localhost:4000')
export const xAlphTokenId = powfiSdk.staking.getConfig().xAlphTokenId

powfiSdk.setCurrentProviders()
