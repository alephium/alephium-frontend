/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { NetworkPreset, NetworkSettings, networkSettingsPresets } from '@alephium/shared'
import { parseChain, PROVIDER_NAMESPACE } from '@alephium/walletconnect-provider'
import { SignClient } from '@walletconnect/sign-client/dist/types/client'

import { SessionProposalEvent } from '@/types/walletConnect'

// TODO: Move to shared
export const isNetworkValid = (networkId: string, currentNetworkId: NetworkSettings['networkId']) =>
  (networkId === 'devnet' && currentNetworkId === 4) ||
  (Object.keys(networkSettingsPresets) as Array<NetworkPreset>).some(
    (network) => network === networkId && currentNetworkId === networkSettingsPresets[network].networkId
  )

export const parseSessionProposalEvent = (proposalEvent: SessionProposalEvent) => {
  const { id, requiredNamespaces, relays } = proposalEvent.params
  const { metadata } = proposalEvent.params.proposer
  const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE]
  const requiredChains = requiredNamespace.chains
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
