import { KeyType } from '@alephium/web3'

import { Network } from '../types/network'

export type AlephiumAccountType = 'alephium'
export type SignerType = 'local_secret'
export interface WalletAccountSigner {
  type: SignerType
  keyType: KeyType
  publicKey: string
  derivationIndex: number
  group: number
}

export interface WithSigner {
  signer: WalletAccountSigner
}

export interface BaseWalletAccount {
  address: string
  networkId: string
}

export interface WalletAccount extends BaseWalletAccount, WithSigner {
  type: AlephiumAccountType
  hidden?: boolean
}

export type WalletAccountWithNetwork = Omit<WalletAccount, 'networkId'> & { network: Network }

export type StoredWalletAccount = Omit<WalletAccount, 'network'>
