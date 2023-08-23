/*
Copyright 2018 - 2022 The Alephium Authors
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

import { formatChain, isCompatibleAddressGroup, parseChain, PROVIDER_NAMESPACE } from '@alephium/walletconnect-provider'
import { SessionTypes } from '@walletconnect/types'
import { AlertTriangle } from 'lucide-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useState } from 'react'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import HighlightRow from '~/components/HighlightRow'
import InfoBox from '~/components/InfoBox'
import BoxSurface from '~/components/layout/BoxSurface'
import { ModalProps, ScrollModal } from '~/components/layout/Modals'
import { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/WalletConnectContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { networkPresetSettings, persistSettings } from '~/persistent-storage/settings'
import { selectAllAddresses } from '~/store/addressesSlice'
import { networkPresetSwitched } from '~/store/networkSlice'
import { Address } from '~/types/addresses'
import { NetworkName, NetworkPreset } from '~/types/network'
import { NetworkSettings } from '~/types/settings'

interface WalletConnectModalProps extends ModalProps<ScrollScreenProps> {
  rejectProposal: () => Promise<void>
}

const WalletConnectModal = ({ onClose, rejectProposal, ...props }: WalletConnectModalProps) => {
  const { walletConnectClient, proposalEvent, requiredChainInfo, onSessionDelete, onProposalApprove } =
    useWalletConnectContext()
  const posthog = usePostHog()
  const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const addresses = useAppSelector(selectAllAddresses)
  const dispatch = useAppDispatch()

  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [signerAddress, setSignerAddress] = useState<Address>()
  const [signerAddressOptions, setSignerAddressOptions] = useState<Address[]>([])

  const metadata = proposalEvent?.params.proposer.metadata
  const group = requiredChainInfo?.addressGroup

  const showNetworkWarning = requiredChainInfo?.networkId
    ? !isNetworkValid(requiredChainInfo?.networkId, currentNetworkId)
    : false

  const handleReject = async () => {
    setRejecting(true)
    await rejectProposal()
    setRejecting(false)
    onClose && onClose()

    posthog?.capture('WC: Rejected connection by clicking "Reject"')
  }

  const handleApprove = async () => {
    if (!walletConnectClient || !signerAddress) return
    if (proposalEvent === undefined) {
      console.log('deleting session from handleApprove')
      return onSessionDelete()
    }

    const { id, requiredNamespaces, relays } = proposalEvent.params
    const requiredNamespace = requiredNamespaces[PROVIDER_NAMESPACE]

    if (requiredNamespace?.chains?.length !== 1) {
      // return dispatch(
      //   walletConnectProposalApprovalFailed(
      //     t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
      //       num: requiredNamespace?.chains?.length
      //     })
      //   )
      // )
      console.log('ERROR: requiredNamespace?.chains?.length !== 1')
      return
    }

    const requiredChain = parseChain(requiredNamespace.chains[0])

    if (!isNetworkValid(requiredChain.networkId, currentNetworkId)) {
      // return dispatch(
      //   walletConnectProposalApprovalFailed(
      //     t(
      //       'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
      //       {
      //         currentNetwork: currentNetwork.name,
      //         walletConnectNetwork: requiredChain.networkId
      //       }
      //     )
      //   )
      // )
      console.log('ERROR: !isNetworkValid(requiredChain.networkId, currentNetworkId)')
      return
    }

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChain.addressGroup)) {
      // return dispatch(
      //   walletConnectProposalApprovalFailed(
      //     t(
      //       'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
      //       {
      //         addressGroup: signerAddress.group,
      //         walletConnectGroup: requiredChain.addressGroup
      //       }
      //     )
      //   )
      // )
      console.log('ERROR: !isCompatibleAddressGroup(signerAddress.group, requiredChain.addressGroup')
      return
    }

    const namespaces: SessionTypes.Namespaces = {
      alephium: {
        methods: requiredNamespace.methods,
        events: requiredNamespace.events,
        accounts: [
          `${formatChain(requiredChain.networkId, requiredChain.addressGroup)}:${signerAddress.publicKey}/default`
        ]
      }
    }

    setApproving(true)

    const { topic, acknowledged } = await walletConnectClient.approve({
      id,
      relayProtocol: relays[0].protocol,
      namespaces
    })
    onProposalApprove(topic)
    await acknowledged()
    setApproving(false)
    onClose && onClose()

    posthog?.capture('WC: Approved connection')
  }

  useEffect(() => {
    const addressOptions = group === undefined ? addresses : addresses.filter((a) => a.group === group)

    setSignerAddressOptions(addressOptions)
    setSignerAddress(
      addressOptions.length > 0 ? addressOptions.find((a) => a.settings.isDefault) ?? addressOptions[0] : undefined
    )
  }, [addresses, group])

  const handleSignerAddressPress = () => {
    if (!signerAddress) {
      console.log('TODO: Open modal to create address in group', group)
    } else {
      // TODO: Use `signerAddressOptions`
      console.log('TODO: Open modal to select address of group', group)
    }
  }

  const handleSwitchNetworkPress = async () => {
    if (requiredChainInfo?.networkId === 'mainnet' || requiredChainInfo?.networkId === 'testnet') {
      await persistSettings('network', networkPresetSettings[requiredChainInfo.networkId])
      dispatch(networkPresetSwitched(NetworkName[requiredChainInfo.networkId]))
    }
  }

  return (
    <ScrollModal {...props}>
      <ScreenSection>
        {metadata?.icons && metadata.icons.length > 0 && <DAppIcon source={{ uri: metadata.icons[0] }} />}
        <BottomModalScreenTitle>
          {metadata?.name ? `Connect to ${metadata?.name}` : 'Connect to the dApp'}
        </BottomModalScreenTitle>
        {metadata?.description && (
          <AppText color="secondary" size={16}>
            {metadata.description}
          </AppText>
        )}
        {metadata?.url && (
          <AppText color="tertiary" size={13}>
            {metadata.url}
          </AppText>
        )}
      </ScreenSection>
      {showNetworkWarning && (
        <>
          <ScreenSection>
            <InfoBox title="Switch network" Icon={AlertTriangle}>
              <AppText bold>
                You are currently connected to <AppText color="accent">{currentNetworkName}</AppText>, but the dApp
                requires a connection to <AppText color="accent">{requiredChainInfo?.networkId}</AppText>.
              </AppText>
            </InfoBox>
          </ScreenSection>
          <BottomScreenSection>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={handleReject} />
              <Button title="Switch network" variant="accent" onPress={handleSwitchNetworkPress} />
            </ButtonsRow>
          </BottomScreenSection>
        </>
      )}
      {!showNetworkWarning && (
        <>
          <ScreenSection>
            <BoxSurface>
              <HighlightRow title="Signer address" onPress={handleSignerAddressPress}>
                {signerAddress ? (
                  <AddressBadge addressHash={signerAddress?.hash} />
                ) : (
                  <AppText>Click to create an address in group {group}</AppText>
                )}
              </HighlightRow>
            </BoxSurface>
          </ScreenSection>
          <BottomScreenSection>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={handleReject} />
              <Button title="Accept" variant="valid" onPress={handleApprove} />
            </ButtonsRow>
          </BottomScreenSection>
        </>
      )}
      <SpinnerModal
        isActive={rejecting || approving}
        text={rejecting ? 'Rejecting connection...' : approving ? 'Approving connection' : ''}
      />
    </ScrollModal>
  )
}

export default WalletConnectModal

const isNetworkValid = (networkId: string, currentNetworkId: NetworkSettings['networkId']) =>
  (networkId === 'devnet' && currentNetworkId === 4) ||
  (Object.keys(networkPresetSettings) as Array<NetworkPreset>).some(
    (network) => network === networkId && currentNetworkId === networkPresetSettings[network].networkId
  )

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
