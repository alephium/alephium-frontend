import { parseChain, PROVIDER_NAMESPACE } from '@alephium/walletconnect-provider'
import { SignClient } from '@walletconnect/sign-client/dist/types/client'

import { networkSettingsPresets } from '@/network'
import { NetworkPreset, NetworkSettings } from '@/types/network'
import { SessionProposalEvent } from '@/types/walletConnect'

export const isNetworkValid = (networkId: string, currentNetworkId: NetworkSettings['networkId']) =>
  (networkId === 'devnet' && currentNetworkId === 4) ||
  (Object.keys(networkSettingsPresets) as Array<NetworkPreset>).some(
    (network) => network === networkId && currentNetworkId === networkSettingsPresets[network].networkId
  )

export const parseSessionProposalEvent = (proposalEvent: SessionProposalEvent) => {
  const { id, requiredNamespaces, relays } = proposalEvent.params
  const { metadata } = proposalEvent.params.proposer
  const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE]
  const requiredChains = requiredNamespace ? requiredNamespace.chains : undefined
  const requiredChainInfo = requiredChains ? parseChain(requiredChains[0]) : undefined

  return {
    id,
    relayProtocol: relays[0].protocol,
    requiredNamespace,
    requiredChains,
    requiredChainInfo,
    metadata
  }
}

export const getActiveWalletConnectSessions = (walletConnectClient?: SignClient) => {
  if (!walletConnectClient) return []

  const activePairings = walletConnectClient.core.pairing.getPairings().filter((pairing) => pairing.active)

  return walletConnectClient.session.values.filter((session) =>
    activePairings.some((pairing) => pairing.topic === session.pairingTopic)
  )
}
