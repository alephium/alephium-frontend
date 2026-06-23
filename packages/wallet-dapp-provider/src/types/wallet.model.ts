import { KeyType } from '@alephium/web3'

import { Network } from '../types/network'

type AlephiumAccountType = 'alephium'
type SignerType = 'local_secret'
interface WalletAccountSigner {
  type: SignerType
  keyType: KeyType
  publicKey: string
  derivationIndex: number
  group?: number
}

interface WithSigner {
  signer: WalletAccountSigner
}

export interface BaseWalletAccount {
  address: string
  networkId: string
}

interface WalletAccount extends BaseWalletAccount, WithSigner {
  type: AlephiumAccountType
  hidden?: boolean
}

export type WalletAccountWithNetwork = Omit<WalletAccount, 'networkId'> & { network: Network }
