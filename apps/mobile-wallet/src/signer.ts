import { AlephiumWalletSigner } from '@alephium/shared'
import { transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

class SecureStoreSigner extends AlephiumWalletSigner {
  public getPublicKey = async (addressStr: string): Promise<string> => getAddressAsymetricKey(addressStr, 'public')

  public signRaw = async (addressStr: string, tx: string): Promise<string> =>
    transactionSign(tx, await getAddressAsymetricKey(addressStr, 'private'))
}

export const signer = new SecureStoreSigner()
