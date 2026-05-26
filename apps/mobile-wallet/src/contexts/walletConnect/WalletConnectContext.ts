import type { IWalletKit } from '@reown/walletkit'
import type { SessionTypes } from '@walletconnect/types'
import { createContext, useContext } from 'react'

export interface WalletConnectContextValue {
  walletConnectClient?: IWalletKit
  pairWithDapp: (uri: string) => Promise<void>
  unpairFromDapp: (pairingTopic: string) => Promise<void>
  activeSessions: SessionTypes.Struct[]
  refreshActiveSessions: () => void

  resetWalletConnectClientInitializationAttempts: () => void
  resetWalletConnectStorage: () => void
}

export const walletConnectContextStubValue: WalletConnectContextValue = {
  walletConnectClient: undefined,
  pairWithDapp: () => Promise.resolve(),
  unpairFromDapp: () => Promise.resolve(),
  activeSessions: [],
  refreshActiveSessions: () => null,

  resetWalletConnectClientInitializationAttempts: () => null,
  resetWalletConnectStorage: () => null
}

export const WalletConnectContext = createContext(walletConnectContextStubValue)

export const useWalletConnectContext = () => useContext(WalletConnectContext)
