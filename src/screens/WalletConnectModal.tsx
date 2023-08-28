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

import { deriveNewAddressData, walletImportAsyncUnsafe } from '@alephium/sdk'
import { formatChain, isCompatibleAddressGroup, parseChain, PROVIDER_NAMESPACE } from '@alephium/walletconnect-provider'
import { SessionTypes } from '@walletconnect/types'
import { AlertTriangle, PlusSquare } from 'lucide-react-native'
import { usePostHog } from 'posthog-react-native'
import { useEffect, useRef, useState } from 'react'
import { Image } from 'react-native'
import Toast from 'react-native-root-toast'
import styled from 'styled-components/native'

import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import InfoBox from '~/components/InfoBox'
import { ModalProps, ScrollModal } from '~/components/layout/Modals'
import { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/WalletConnectContext'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { networkPresetSettings, persistSettings } from '~/persistent-storage/settings'
import { selectAddressesInGroup } from '~/store/addresses/addressesSelectors'
import {
  newAddressGenerated,
  selectAllAddresses,
  syncAddressesData,
  syncAddressesHistoricBalances
} from '~/store/addressesSlice'
import { networkPresetSwitched } from '~/store/networkSlice'
import { Address } from '~/types/addresses'
import { NetworkName, NetworkPreset } from '~/types/network'
import { NetworkSettings } from '~/types/settings'
import { getRandomLabelColor } from '~/utils/colors'
import { mnemonicToSeed } from '~/utils/crypto'

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
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const persistAddressSettings = usePersistAddressSettings()
  const group = requiredChainInfo?.addressGroup
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))

  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)
  const [generatingNewAddress, setGeneratingNewAddress] = useState(false)
  const [signerAddress, setSignerAddress] = useState<Address>()
  const [showAlternativeSignerAddresses, setShowAlternativeSignerAddresses] = useState(false)

  const metadata = proposalEvent?.params.proposer.metadata

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

    if (requiredNamespace?.chains?.length !== 1)
      return Toast.show(
        `Too many chains in the WalletConnect proposal, expected 1, got ${requiredNamespace?.chains?.length}`
      )

    const requiredChain = parseChain(requiredNamespace.chains[0])

    if (!isNetworkValid(requiredChain.networkId, currentNetworkId))
      return Toast.show(
        `The current network (${currentNetworkName}) does not match the network requested by WalletConnect (${requiredChain.networkId})`
      )

    if (!isCompatibleAddressGroup(signerAddress.group, requiredChain.addressGroup))
      return Toast.show(
        `The group of the selected address (${signerAddress.group}) does not match the group required by WalletConnect (${requiredChain.addressGroup})`
      )

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

    try {
      console.log('approving...')
      const { topic, acknowledged } = await walletConnectClient.approve({
        id,
        relayProtocol: relays[0].protocol,
        namespaces
      })
      console.log('approved.')
      onProposalApprove(topic)
      console.log('acknowledging...')
      const res = await acknowledged()
      console.log('acknowledged.')
      console.log('acknow result:', res)

      setApproving(false)
      posthog?.capture('WC: Approved connection')
    } catch (e) {
      console.error('WC: Error while approving and acknowledging', e)
    }
    onClose && onClose()
  }

  useEffect(() => {
    setSignerAddress(
      addressesInGroup.length > 0
        ? addressesInGroup.find((a) => a.settings.isDefault) ?? addressesInGroup[0]
        : undefined
    )
  }, [addressesInGroup])

  const handleSwitchNetworkPress = async () => {
    if (requiredChainInfo?.networkId === 'mainnet' || requiredChainInfo?.networkId === 'testnet') {
      await persistSettings('network', networkPresetSettings[requiredChainInfo.networkId])
      dispatch(networkPresetSwitched(NetworkName[requiredChainInfo.networkId]))
    }
  }

  const handleAddressGeneratePress = async () => {
    setGeneratingNewAddress(true)

    const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, activeWalletMnemonic)
    const newAddressData = deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes.current)
    const newAddress = { ...newAddressData, settings: { label: '', color: getRandomLabelColor(), isDefault: false } }

    try {
      await persistAddressSettings(newAddress)
      dispatch(newAddressGenerated(newAddress))
      await dispatch(syncAddressesData(newAddress.hash))
      await dispatch(syncAddressesHistoricBalances(newAddress.hash))

      posthog?.capture('WC: Generated new address')
    } catch (e) {
      console.error('WC: Could not save new address', e)

      posthog?.capture('Error', { message: 'WC: Could not save new address' })
    }

    setGeneratingNewAddress(false)
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
      {showNetworkWarning ? (
        <>
          <ScreenSection>
            <InfoBox title="Switch network" Icon={AlertTriangle}>
              <AppText>
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
      ) : !signerAddress ? (
        <>
          <ScreenSection>
            <InfoBox title="New address needed" Icon={PlusSquare}>
              <AppText>
                The dApp asks for an address in group <AppText color="accent">{group}</AppText>. Click below to generate
                one!
              </AppText>
            </InfoBox>
          </ScreenSection>
          <BottomScreenSection>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={handleReject} />
              <Button title="Generate new address" variant="accent" onPress={handleAddressGeneratePress} />
            </ButtonsRow>
          </BottomScreenSection>
        </>
      ) : (
        <>
          <ScreenSection>
            <SectionTitle semiBold>Connect with address</SectionTitle>
            <SectionSubtitle color="secondary">Tap to change the address to connect with.</SectionSubtitle>
            <AddressBox addressHash={signerAddress.hash} onPress={() => setShowAlternativeSignerAddresses(true)} />
          </ScreenSection>
          <BottomScreenSection>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={handleReject} />
              <Button title="Accept" variant="valid" onPress={handleApprove} disabled={!signerAddress} />
            </ButtonsRow>
          </BottomScreenSection>
        </>
      )}
      {showAlternativeSignerAddresses && (
        <ScreenSection>
          <SectionTitle semiBold>Addresses in group {group}</SectionTitle>
          <SectionSubtitle color="secondary">Tap to select another one</SectionSubtitle>
          <AddressList>
            {addressesInGroup.map((address, index) => (
              <AddressBox
                key={address.hash}
                addressHash={address.hash}
                isSelected={address.hash === signerAddress?.hash}
                onPress={() => {
                  setSignerAddress(address)
                  setShowAlternativeSignerAddresses(false)
                  posthog?.capture('WC: Switched signer address')
                }}
              />
            ))}
            <PlaceholderBox>
              <SectionSubtitle>
                If none of the above addresses fit your needs, you can generate a new one.
              </SectionSubtitle>
              <Button title="Generate new address" variant="accent" onPress={handleAddressGeneratePress} />
            </PlaceholderBox>
          </AddressList>
        </ScreenSection>
      )}
      <SpinnerModal
        isActive={rejecting || approving || generatingNewAddress}
        text={
          rejecting
            ? 'Rejecting connection...'
            : approving
            ? 'Approving connection'
            : generatingNewAddress
            ? 'Generating new address...'
            : ''
        }
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

const SectionTitle = styled(AppText)`
  font-size: 18px;
`
const SectionSubtitle = styled(AppText)`
  margin-bottom: 8px;
`

const AddressList = styled.View`
  gap: 10px;
`

const PlaceholderBox = styled.View`
  border: 2px dashed ${({ theme }) => theme.border.primary};
  border-radius: 9px;
  padding: 15px;
`
