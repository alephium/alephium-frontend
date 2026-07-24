import { AlephiumWalletSigner } from '@alephium/shared'
import { getBaseAddressStr } from '@alephium/shared/transactions'
import { transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'
import { store } from '~/store/store'

export class SecureStoreSigner extends AlephiumWalletSigner {
  private getWalletId = (): string => store.getState().wallet.id

  public getPublicKey = async (addressStr: string): Promise<string> =>
    getAddressAsymetricKey(this.getWalletId(), getBaseAddressStr(addressStr), 'public')

  public signRaw = async (addressStr: string, tx: string): Promise<string> => {
    const baseAddressStr = getBaseAddressStr(addressStr)
    const keyType = store.getState().addresses.entities[baseAddressStr]?.keyType

    return transactionSign(tx, await getAddressAsymetricKey(this.getWalletId(), baseAddressStr, 'private'), keyType)
  }
}

export const signer = new SecureStoreSigner()
