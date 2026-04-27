import { AlephiumWalletSigner, getBaseAddressStr } from '@alephium/shared'
import { transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/addressKeys'
import { store } from '~/store/store'

export class SecureStoreSigner extends AlephiumWalletSigner {
  private getWalletId = (): string => store.getState().wallet.id

  public getPublicKey = async (addressStr: string): Promise<string> =>
    getAddressAsymetricKey(this.getWalletId(), getBaseAddressStr(addressStr), 'public')

  public signRaw = async (addressStr: string, tx: string): Promise<string> =>
    transactionSign(tx, await getAddressAsymetricKey(this.getWalletId(), getBaseAddressStr(addressStr), 'private'))
}

export const signer = new SecureStoreSigner()
