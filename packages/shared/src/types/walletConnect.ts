import { ChainInfo } from '@alephium/walletconnect-provider'
import { CoreTypes, ProposalTypes, SignClientTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'

export type WalletConnectClientStatus = 'uninitialized' | 'initializing' | 'initialized' | 'initialization-failed'

export type WalletConnectError = ReturnType<typeof getSdkError>

export type SessionRequestEvent = SignClientTypes.EventArguments['session_request']

export type SessionProposalEvent = Pick<SignClientTypes.EventArguments['session_proposal'], 'id' | 'params'>

export interface WalletConnectSessionProposalModalProps {
  chain: string
  proposalEventId: SessionProposalEvent['id']
  requiredNamespaceMethods: ProposalTypes.BaseRequiredNamespace['methods']
  requiredNamespaceEvents: ProposalTypes.BaseRequiredNamespace['events']
  metadata: CoreTypes.Metadata
  chainInfo: ChainInfo
  relayProtocol?: string
}
