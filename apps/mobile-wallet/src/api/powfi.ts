import type { App } from '@alephium/powfi-backend'
import { Powfi } from '@alephium/powfi-sdk'
import { treaty } from '@elysiajs/eden'

import { stakingSigner } from '~/features/staking/stakingSigner'
import { swapSigner } from '~/features/swap/swapSigner'

export const powfiSdk = Powfi.load({ networkId: 'testnet', signer: stakingSigner })
// A separate instance so the swap's per-address signer can never leak into staking (both share the
// global testnet providers set below; each instance also carries its own testnet providers).
export const powfiSwapSdk = Powfi.load({ networkId: 'testnet', signer: swapSigner })
export const powfiBackend = treaty<App>(process.env.EXPO_PUBLIC_POWFI_BACKEND_HOST || 'http://localhost:4000')
export const xAlphTokenId = powfiSdk.staking.getConfig().xAlphTokenId

powfiSdk.setCurrentProviders()
