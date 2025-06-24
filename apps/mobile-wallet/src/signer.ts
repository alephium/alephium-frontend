import { throttledClient } from '@alephium/shared'
import { Account, SignerProviderSimple, transactionSign } from '@alephium/web3'

import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

class SecureStoreSigner extends SignerProviderSimple {
  public getPublicKey = async (addressStr: string): Promise<string> => getAddressAsymetricKey(addressStr, 'public')

  public signRaw = async (addressStr: string, tx: string): Promise<string> =>
    transactionSign(tx, await getAddressAsymetricKey(addressStr, 'private'))

  public get nodeProvider() {
    return throttledClient.node
  }

  public get explorerProvider() {
    return throttledClient.explorer
  }

  protected unsafeGetSelectedAccount(): Promise<Account> {
    throw Error('Not implemented')
  }
}

export const signer = new SecureStoreSigner()
