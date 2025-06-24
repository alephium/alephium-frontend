import { keyring } from '@alephium/keyring'
import { AlephiumWalletSigner } from '@alephium/shared'

class InMemorySigner extends AlephiumWalletSigner {
  public getPublicKey = async (addressStr: string): Promise<string> => keyring.exportPublicKeyOfAddress(addressStr)

  public signRaw = async (address: string, tx: string): Promise<string> => keyring.signTransaction(tx, address)
}

export const signer = new InMemorySigner()
