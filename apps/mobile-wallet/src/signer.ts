import { AlephiumWalletSigner } from '@alephium/shared'
import { selectAddressByHash } from '@alephium/shared/store'
import { getBaseAddressStr } from '@alephium/shared/transactions'
import { AddressHash } from '@alephium/shared/types'
import { isGrouplessAddress } from '@alephium/shared/utils'
import { Account, transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'
import { RootState, store } from '~/store/store'

export class SecureStoreSigner extends AlephiumWalletSigner {
  private getWalletId = (): string => store.getState().wallet.id

  public getPublicKey = async (addressStr: string): Promise<string> =>
    getAddressAsymetricKey(this.getWalletId(), getBaseAddressStr(addressStr), 'public')

  public signRaw = async (addressStr: string, tx: string): Promise<string> =>
    transactionSign(tx, await getAddressAsymetricKey(this.getWalletId(), getBaseAddressStr(addressStr), 'private'))
}

export const signer = new SecureStoreSigner()

// The Powfi SDK derives the tx signer from getSelectedAccount(), so parameterizing it by a selector
// scopes each Powfi flow (swap, staking) to its own chosen address instead of one hardcoded default.
export class SelectedAddressSigner extends SecureStoreSigner {
  constructor(private selectAddressHash: (state: RootState) => AddressHash | undefined) {
    super()
  }

  protected unsafeGetSelectedAccount = async (): Promise<Account> => {
    const state = store.getState()
    const addressHash = this.selectAddressHash(state)
    const address = addressHash ? selectAddressByHash(state, addressHash) : undefined

    if (!address) throw new Error('No address selected')

    const publicKey = await this.getPublicKey(address.hash)

    return isGrouplessAddress(address)
      ? { address: address.hash, keyType: address.keyType, publicKey }
      : { address: address.hash, keyType: address.keyType, publicKey, group: address.group }
  }
}
