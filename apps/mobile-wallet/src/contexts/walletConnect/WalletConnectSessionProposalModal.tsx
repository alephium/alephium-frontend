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

import { deriveNewAddressData, walletImportAsyncUnsafe } from '@alephium/shared'
import { AlertTriangle, PlusSquare } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import InfoBox from '~/components/InfoBox'
import { ModalContent, ModalContentProps } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
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
import { NetworkName } from '~/types/network'
import { SessionProposalEvent } from '~/types/walletConnect'
import { getRandomLabelColor } from '~/utils/colors'
import { mnemonicToSeed } from '~/utils/crypto'
import { isNetworkValid, parseSessionProposalEvent } from '~/utils/walletConnect'

interface WalletConnectSessionProposalModalProps extends ModalContentProps {
  approveProposal: (signerAddress: Address) => Promise<void>
  rejectProposal: () => Promise<void>
  proposalEvent: SessionProposalEvent
}

const WalletConnectSessionProposalModal = ({
  onClose,
  approveProposal,
  rejectProposal,
  proposalEvent,
  ...props
}: WalletConnectSessionProposalModalProps) => {
  const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)
  const addresses = useAppSelector(selectAllAddresses)
  const dispatch = useAppDispatch()
  const walletMnemonic = useAppSelector((s) => s.wallet.mnemonic)
  const { requiredChainInfo, metadata } = parseSessionProposalEvent(proposalEvent)
  const group = requiredChainInfo?.addressGroup
  const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
  const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
  const persistAddressSettings = usePersistAddressSettings()

  const [loading, setLoading] = useState('')
  const [signerAddress, setSignerAddress] = useState<Address>()
  const [showAlternativeSignerAddresses, setShowAlternativeSignerAddresses] = useState(false)

  const showNetworkWarning =
    requiredChainInfo?.networkId && !isNetworkValid(requiredChainInfo.networkId, currentNetworkId)

  useEffect(() => {
    setSignerAddress(
      addressesInGroup.length > 0
        ? addressesInGroup.find((a) => a.settings.isDefault) ?? addressesInGroup[0]
        : undefined
    )
  }, [addressesInGroup])

  const handleSwitchNetworkPress = async () => {
    if (requiredChainInfo?.networkId === 'mainnet' || requiredChainInfo?.networkId === 'testnet') {
      await persistSettings('network', networkPresetSettings[requiredChainInfo?.networkId])
      dispatch(networkPresetSwitched(NetworkName[requiredChainInfo?.networkId]))
    }
  }

  const handleAddressGeneratePress = async () => {
    setLoading('Generating new address...')

    const { masterKey } = await walletImportAsyncUnsafe(mnemonicToSeed, walletMnemonic)
    const newAddressData = deriveNewAddressData(masterKey, group, undefined, currentAddressIndexes.current)
    const newAddress = { ...newAddressData, settings: { label: '', color: getRandomLabelColor(), isDefault: false } }

    try {
      await persistAddressSettings(newAddress)
      dispatch(newAddressGenerated(newAddress))
      await dispatch(syncAddressesData(newAddress.hash))
      await dispatch(syncAddressesHistoricBalances(newAddress.hash))

      sendAnalytics('WC: Generated new address')
    } catch (e) {
      console.error('WC: Could not save new address', e)

      sendAnalytics('Error', { message: 'WC: Could not save new address' })
    }

    setLoading('')
  }

  return (
    <ModalContent verticalGap {...props}>
      <ScreenSection>
        {metadata?.icons && metadata.icons.length > 0 && metadata.icons[0] && (
          <DAppIcon source={{ uri: metadata.icons[0] }} />
        )}
        <BottomModalScreenTitle>Connect to dApp</BottomModalScreenTitle>
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
          <ScreenSection centered>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={rejectProposal} flex />
              <Button title="Switch network" variant="accent" onPress={handleSwitchNetworkPress} flex />
            </ButtonsRow>
          </ScreenSection>
        </>
      ) : !signerAddress ? (
        <>
          <ScreenSection>
            <InfoBox title="New address needed" Icon={PlusSquare}>
              <AppText>
                The dApp asks for an address in group
                <AppText color="accent"> {group}</AppText>. Click below to generate one!
              </AppText>
            </InfoBox>
          </ScreenSection>
          <ScreenSection centered>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={rejectProposal} flex />
              <Button title="Generate new address" variant="accent" onPress={handleAddressGeneratePress} flex />
            </ButtonsRow>
          </ScreenSection>
        </>
      ) : (
        <>
          {showAlternativeSignerAddresses ? (
            <ScreenSection>
              <SectionTitle semiBold>Addresses{group !== undefined ? ` in group ${group}` : ''}</SectionTitle>
              <SectionSubtitle color="secondary">Tap to select another one</SectionSubtitle>
              <AddressList>
                {addressesInGroup.map((address) => (
                  <AddressBox
                    key={address.hash}
                    addressHash={address.hash}
                    isSelected={address.hash === signerAddress?.hash}
                    onPress={() => {
                      setSignerAddress(address)
                      setShowAlternativeSignerAddresses(false)
                      sendAnalytics('WC: Switched signer address')
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
          ) : (
            <ScreenSection>
              <SectionTitle semiBold>Connect with address</SectionTitle>
              <SectionSubtitle color="secondary">Tap to change the address to connect with.</SectionSubtitle>
              <AddressBox
                addressHash={signerAddress.hash}
                onPress={() => setShowAlternativeSignerAddresses(true)}
                isSelected
              />
            </ScreenSection>
          )}

          <ScreenSection centered>
            <ButtonsRow>
              <Button title="Decline" variant="alert" onPress={rejectProposal} flex />
              <Button
                title="Accept"
                variant="valid"
                onPress={() => approveProposal(signerAddress)}
                disabled={!signerAddress}
                flex
              />
            </ButtonsRow>
          </ScreenSection>
        </>
      )}

      <SpinnerModal isActive={!!loading} text={loading} />
    </ModalContent>
  )
}

export default WalletConnectSessionProposalModal

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
