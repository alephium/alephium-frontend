import { WalletConnectClientStatus } from '@/types/walletConnect'

export type ClientsState = {
  walletConnect: {
    status: WalletConnectClientStatus
    errorMessage: WalletConnectErrorMessage
  }
}

export type WalletConnectErrorMessage = string
