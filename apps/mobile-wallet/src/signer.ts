import { AlephiumWalletSigner } from '@alephium/shared'
import { selectAddressByHash } from '@alephium/shared/store'
import { getBaseAddressStr } from '@alephium/shared/transactions'
import { Address, AddressHash } from '@alephium/shared/types'
import { isGrouplessAddress } from '@alephium/shared/utils'
import { Account, transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'
import { RootState, store } from '~/store/store'

export class SecureStoreSigner extends AlephiumWalletSigner {
  private getWalletId = (): string => store.getState().wallet.id

  public getPublicKey = async (addressStr: string): Promise<string> =>
    getAddressAsymetricKey(this.getWalletId(), getBaseAddressStr(addressStr), 'public')

  protected getAddress = (addressHash: AddressHash): Address => {
    const address = selectAddressByHash(store.getState(), addressHash)

    if (!address) throw new Error(`Address not found: ${addressHash}`)

    return address
  }

  public signRaw = async (addressStr: string, tx: string): Promise<string> => {
    const addressHash = getBaseAddressStr(addressStr)
    const { keyType } = this.getAddress(addressHash)

    return transactionSign(tx, await getAddressAsymetricKey(this.getWalletId(), addressHash, 'private'), keyType)
  }
}

export const signer = new SecureStoreSigner()

// The Powfi SDK derives the tx signer from getSelectedAccount(), so parameterizing it by a selector
// scopes each Powfi flow (swap, staking) to its own chosen address instead of one hardcoded default.
export class SelectedAddressSigner extends SecureStoreSigner {
  constructor(private selectAddressHash: (state: RootState) => AddressHash | undefined) {
    super()
  }

  protected unsafeGetSelectedAccount = async (): Promise<Account> => {
    const addressHash = this.selectAddressHash(store.getState())

    if (!addressHash) throw new Error('No address selected')

    const address = this.getAddress(addressHash)
    const publicKey = await this.getPublicKey(address.hash)

    return isGrouplessAddress(address)
      ? { address: address.hash, keyType: address.keyType, publicKey }
      : { address: address.hash, keyType: address.keyType, publicKey, group: address.group }
  }
}
