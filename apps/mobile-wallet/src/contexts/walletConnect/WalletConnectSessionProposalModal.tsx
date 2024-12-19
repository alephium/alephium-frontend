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

import { keyring } from '@alephium/keyring'
import {
  isNetworkValid,
  NetworkNames,
  networkPresetSwitched,
  networkSettingsPresets,
  parseSessionProposalEvent,
  SessionProposalEvent
} from '@alephium/shared'
import { AlertTriangle, PlusSquare } from 'lucide-react-native'
import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Image } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import InfoBox from '~/components/InfoBox'
import { ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { selectAddressesInGroup } from '~/store/addresses/addressesSelectors'
import { newAddressGenerated, selectAllAddresses, syncLatestTransactions } from '~/store/addressesSlice'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { Address } from '~/types/addresses'
import { getRandomLabelColor } from '~/utils/colors'

interface WalletConnectSessionProposalModalProps {
  approveProposal: (signerAddress: Address) => Promise<void>
  rejectProposal: () => Promise<void>
  proposalEvent: SessionProposalEvent
}

const WalletConnectSessionProposalModal = withModal<WalletConnectSessionProposalModalProps>(
  ({ id, approveProposal, rejectProposal, proposalEvent }) => {
    const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
    const currentNetworkName = useAppSelector((s) => s.network.name)
    const addresses = useAppSelector(selectAllAddresses)
    const dispatch = useAppDispatch()
    const { requiredChainInfo, metadata } = parseSessionProposalEvent(proposalEvent)
    const group = requiredChainInfo?.addressGroup
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
    const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
    const persistAddressSettings = usePersistAddressSettings()
    const { t } = useTranslation()

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
      if (
        requiredChainInfo?.networkId === 'mainnet' ||
        requiredChainInfo?.networkId === 'testnet' ||
        requiredChainInfo?.networkId === 'devnet'
      ) {
        await persistSettings('network', networkSettingsPresets[requiredChainInfo?.networkId])
        dispatch(networkPresetSwitched(NetworkNames[requiredChainInfo?.networkId]))
      }
    }

    const handleAddressGeneratePress = async () => {
      setLoading(`${t('Generating new address')}...`)

      try {
        await initializeKeyringWithStoredWallet()
        const newAddress = {
          ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes.current }),
          settings: { label: '', color: getRandomLabelColor(), isDefault: false }
        }

        await persistAddressSettings(newAddress)
        dispatch(newAddressGenerated(newAddress))
        await dispatch(syncLatestTransactions({ addresses: newAddress.hash, areAddressesNew: true }))

        sendAnalytics({ event: 'WC: Generated new address' })
      } catch (error) {
        sendAnalytics({ type: 'error', error, message: 'WC: Could not save new address' })
      } finally {
        keyring.clear()
      }

      setLoading('')
    }

    const handleApproveProposal = () => {
      signerAddress && approveProposal(signerAddress)
      dispatch(closeModal({ id }))
    }

    const handleRejectProposal = () => {
      rejectProposal()
      dispatch(closeModal({ id }))
    }

    return (
      <BottomModal modalId={id} title={t('Connect to dApp')}>
        <ModalContent verticalGap>
          <ScreenSection>
            <DAppInfo>
              {metadata?.icons && metadata.icons.length > 0 && metadata.icons[0] && (
                <DAppIcon source={{ uri: metadata.icons[0] }} />
              )}

              <DAppName>
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
              </DAppName>
            </DAppInfo>
          </ScreenSection>
          {showNetworkWarning ? (
            <>
              <ScreenSection>
                <InfoBox title={t('Switch network')} Icon={AlertTriangle}>
                  <AppText>
                    <Trans
                      t={t}
                      i18nKey="dAppRequiredNetwork"
                      values={{
                        currentNetwork: currentNetworkName,
                        requiredNetwork: requiredChainInfo?.networkId
                      }}
                      components={{ 1: <AppText color="accent" /> }}
                    >
                      {
                        'You are currently connected to <1>{{ currentNetwork }}</1>, but the dApp requires a connection to <1>{{ requiredNetwork }}</1>.'
                      }
                    </Trans>
                  </AppText>
                </InfoBox>
              </ScreenSection>
              <ScreenSection centered>
                <ButtonsRow>
                  <Button title={t('Decline')} variant="alert" onPress={handleRejectProposal} flex />
                  <Button title={t('Switch network')} variant="accent" onPress={handleSwitchNetworkPress} flex />
                </ButtonsRow>
              </ScreenSection>
            </>
          ) : !signerAddress ? (
            <>
              <ScreenSection>
                <InfoBox title="New address needed" Icon={PlusSquare}>
                  <AppText>
                    <Trans
                      t={t}
                      i18nKey="dAppRequiredGroup"
                      values={{ group }}
                      components={{ 1: <AppText color="accent" /> }}
                    >
                      {'The dApp asks for an address in group <1>{{ group }}</1>. Click below to generate one!'}
                    </Trans>
                  </AppText>
                </InfoBox>
              </ScreenSection>
              <ScreenSection centered>
                <ButtonsRow>
                  <Button title={t('Decline')} variant="alert" onPress={handleRejectProposal} flex />
                  <Button
                    title={t('Generate new address')}
                    variant="accent"
                    onPress={handleAddressGeneratePress}
                    flex
                  />
                </ButtonsRow>
              </ScreenSection>
            </>
          ) : (
            <>
              {showAlternativeSignerAddresses ? (
                <ScreenSection>
                  <SectionTitle semiBold>
                    {group !== undefined
                      ? t('Addresses in group {{ groupNumber }}', { groupNumber: group })
                      : t('Addresses')}
                  </SectionTitle>
                  <SectionSubtitle color="secondary">{t('Tap to select another one')}</SectionSubtitle>
                  <AddressList>
                    {addressesInGroup.map((address, i) => (
                      <AddressBox
                        key={address.hash}
                        addressHash={address.hash}
                        isSelected={address.hash === signerAddress?.hash}
                        onPress={() => {
                          setSignerAddress(address)
                          setShowAlternativeSignerAddresses(false)
                          sendAnalytics({ event: 'WC: Switched signer address' })
                        }}
                        isLast={i === addressesInGroup.length - 1}
                      />
                    ))}
                    <PlaceholderBox>
                      <SectionSubtitle>
                        {t('If none of the above addresses fit your needs, you can generate a new one.')}
                      </SectionSubtitle>
                      <Button title={t('Generate new address')} variant="accent" onPress={handleAddressGeneratePress} />
                    </PlaceholderBox>
                  </AddressList>
                </ScreenSection>
              ) : (
                <ScreenSection>
                  <SectionTitle semiBold>{t('Connect with address')}</SectionTitle>
                  <SectionSubtitle color="secondary">{t('Tap to change the address to connect with.')}</SectionSubtitle>
                  <AddressList>
                    <AddressBox
                      addressHash={signerAddress.hash}
                      onPress={() => setShowAlternativeSignerAddresses(true)}
                      isSelected
                      isLast
                      rounded
                    />
                  </AddressList>
                </ScreenSection>
              )}

              <BottomButtons backgroundColor="back1">
                <Button title={t('Decline')} variant="alert" onPress={handleRejectProposal} flex wide />
                <Button
                  title={t('Accept')}
                  variant="valid"
                  onPress={handleApproveProposal}
                  disabled={!signerAddress}
                  flex
                />
              </BottomButtons>
            </>
          )}

          <SpinnerModal isActive={!!loading} text={loading} />
        </ModalContent>
      </BottomModal>
    )
  }
)

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
  margin-top: ${VERTICAL_GAP}px;
`

const PlaceholderBox = styled.View`
  border: 2px dashed ${({ theme }) => theme.border.primary};
  border-radius: 9px;
  padding: 15px;
`

const DAppInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`

const DAppName = styled.View``
