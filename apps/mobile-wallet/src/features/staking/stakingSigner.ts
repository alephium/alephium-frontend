import { selectDefaultAddress } from '@alephium/shared/store'
import { isGrouplessAddress } from '@alephium/shared/utils'
import { Account } from '@alephium/web3'

import { SecureStoreSigner } from '~/signer'
import { store } from '~/store/store'

class PowfiStakingSigner extends SecureStoreSigner {
  protected unsafeGetSelectedAccount = async (): Promise<Account> => {
    const defaultAddress = selectDefaultAddress(store.getState())

    if (!defaultAddress) throw new Error('No default address selected')

    const publicKey = await this.getPublicKey(defaultAddress.hash)

    return isGrouplessAddress(defaultAddress)
      ? { address: defaultAddress.hash, keyType: defaultAddress.keyType, publicKey }
      : { address: defaultAddress.hash, keyType: defaultAddress.keyType, publicKey, group: defaultAddress.group }
  }
}

export const stakingSigner = new PowfiStakingSigner()
