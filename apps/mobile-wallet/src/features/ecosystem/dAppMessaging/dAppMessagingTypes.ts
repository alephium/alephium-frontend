import { WalletAccountWithNetwork } from '@alephium/wallet-dapp-provider'

export type ConnectedAddressPayload = WalletAccountWithNetwork & {
  host: string
}
