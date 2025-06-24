import { keyring } from '@alephium/keyring'
import { throttledClient } from '@alephium/shared'
import { Account, SignerProviderSimple } from '@alephium/web3'

class InMemorySigner extends SignerProviderSimple {
  public getPublicKey = async (addressStr: string): Promise<string> => keyring.exportPublicKeyOfAddress(addressStr)

  public signRaw = async (address: string, tx: string): Promise<string> => keyring.signTransaction(tx, address)

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

export const signer = new InMemorySigner()
