import { selectAddressByHash } from '@alephium/shared/store'
import { isGrouplessAddress } from '@alephium/shared/utils'
import { Account } from '@alephium/web3'

import { selectSwapFromAddressHash } from '~/features/swap/swapSelectors'
import { SecureStoreSigner } from '~/signer'
import { store } from '~/store/store'

// Signs swaps from the address the user picked on the Swap screen (falling back to the wallet's
// default), unlike the staking signer which is pinned to the default. The Powfi SDK derives the tx
// signer from getSelectedAccount(), and that signer must equal the swap `sender` - so this is what
// makes "swap from any address" actually sign with the right key.
class PowfiSwapSigner extends SecureStoreSigner {
  protected unsafeGetSelectedAccount = async (): Promise<Account> => {
    const state = store.getState()
    const fromAddressHash = selectSwapFromAddressHash(state)
    const address = fromAddressHash ? selectAddressByHash(state, fromAddressHash) : undefined

    if (!address) throw new Error('No address selected for the swap')

    const publicKey = await this.getPublicKey(address.hash)

    return isGrouplessAddress(address)
      ? { address: address.hash, keyType: address.keyType, publicKey }
      : { address: address.hash, keyType: address.keyType, publicKey, group: address.group }
  }
}

export const swapSigner = new PowfiSwapSigner()
