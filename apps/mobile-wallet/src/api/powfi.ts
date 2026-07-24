import type { App } from '@alephium/powfi-backend'
import { Powfi } from '@alephium/powfi-sdk'
import { treaty } from '@elysiajs/eden'

import { selectStakingAddressHash } from '~/features/staking/stakingSelectors'
import { selectSwapFromAddressHash } from '~/features/swap/swapSelectors'
import { SelectedAddressSigner } from '~/signer'

// Swap and staking sign from their own user-chosen address, and a Powfi instance binds exactly one
// signer - hence two separate instances.
const stakingSigner = new SelectedAddressSigner(selectStakingAddressHash)
const swapSigner = new SelectedAddressSigner(selectSwapFromAddressHash)

export const powfiSdk = Powfi.load({ networkId: 'testnet', signer: stakingSigner })
export const powfiSwapSdk = Powfi.load({ networkId: 'testnet', signer: swapSigner })
export const powfiBackend = treaty<App>(process.env.EXPO_PUBLIC_POWFI_BACKEND_HOST || 'http://localhost:4000')
export const xAlphTokenId = powfiSdk.staking.getConfig().xAlphTokenId

powfiSdk.setCurrentProviders()
