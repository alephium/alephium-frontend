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

import {
  AddressHash,
  isNetworkValid,
  networkPresetSwitched,
  parseSessionProposalEvent,
  SessionProposalEvent
} from '@alephium/shared'
import { formatChain, isCompatibleAddressGroup } from '@alephium/walletconnect-provider'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { AlertTriangle, PlusSquare } from 'lucide-react'
import { memo, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AssetLogo from '@/components/AssetLogo'
import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import {
  selectAddressByHash,
  selectAddressesInGroup,
  selectDefaultAddress
} from '@/storage/addresses/addressesSelectors'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { walletConnectProposalApprovalFailed } from '@/storage/dApps/dAppActions'
import { toggleAppLoading } from '@/storage/global/globalActions'
import { Address } from '@/types/addresses'
import { getRandomLabelColor } from '@/utils/colors'
import { cleanUrl, electron } from '@/utils/misc'

export interface WalletConnectSessionProposalModalProps {
  proposalEvent: SessionProposalEvent
}

const WalletConnectSessionProposalModal = memo(
  ({ id: modalId, proposalEvent }: ModalBaseProp & WalletConnectSessionProposalModalProps) => {
    const { t } = useTranslation()
    const { sendAnalytics } = useAnalytics()
    const { walletConnectClient, resetPendingDappConnectionUrl, activeSessions, refreshActiveSessions } =
      useWalletConnectContext()
    const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
    const currentNetworkName = useAppSelector((s) => s.network.name)
    const dispatch = useAppDispatch()
    const { requiredChainInfo, metadata } = parseSessionProposalEvent(proposalEvent)
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, requiredChainInfo?.addressGroup))
    const { generateAddress } = useAddressGeneration()
    const defaultAddress = useAppSelector(selectDefaultAddress)
    const currentNetwork = useAppSelector((s) => s.network)

    const [signerAddressHash, setSignerAddressHash] = useState<AddressHash | undefined>(addressesInGroup[0])
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, signerAddressHash ?? ''))

    const group = requiredChainInfo?.addressGroup

    const showNetworkWarning =
      requiredChainInfo?.networkId && !isNetworkValid(requiredChainInfo.networkId, currentNetworkId)

    useEffect(() => {
      setSignerAddressHash(addressesInGroup.find((a) => a === defaultAddress.hash) ?? addressesInGroup[0])
    }, [addressesInGroup, defaultAddress.hash])

    const handleSwitchNetworkPress = () => {
      if (
        requiredChainInfo?.networkId === 'mainnet' ||
        requiredChainInfo?.networkId === 'testnet' ||
        requiredChainInfo?.networkId === 'devnet'
      ) {
        dispatch(networkPresetSwitched(requiredChainInfo?.networkId))
      }
    }

    const generateAddressInGroup = () => {
      try {
        const address = generateAddress(group)
        saveNewAddresses([{ ...address, isDefault: false, color: getRandomLabelColor() }])

        sendAnalytics({ event: 'New address created through WalletConnect modal' })
      } catch {
        sendAnalytics({ type: 'error', message: 'Error while saving newly generated address from WalletConnect modal' })
      }
    }

    const rejectAndCloseModal = async (clickedDecline?: boolean) => {
      rejectProposal()
      dispatch(closeModal({ id: modalId }))

      sendAnalytics({
        event: clickedDecline
          ? 'Rejected WalletConnect connection by clicking Decline'
          : 'Rejected WalletConnect connection by closing modal'
      })
    }

    const approveProposal = async (signerAddress: Address) => {
      console.log('👍 USER APPROVED PROPOSAL TO CONNECT TO THE DAPP.')
      console.log('⏳ VERIFYING USER PROVIDED DATA...')

      if (!walletConnectClient) {
        console.error('❌ Could not find WalletConnect client')
        return
      }

      const { id, relayProtocol, requiredNamespace, requiredChains, requiredChainInfo, metadata } =
        parseSessionProposalEvent(proposalEvent)

      if (!requiredChains) {
        dispatch(walletConnectProposalApprovalFailed(t('The proposal does not include a list of required chains')))
        return
      }

      if (requiredChains?.length !== 1) {
        dispatch(
          walletConnectProposalApprovalFailed(
            t('Too many chains in the WalletConnect proposal, expected 1, got {{ num }}', {
              num: requiredChains?.length
            })
          )
        )
        return
      }

      if (!requiredChainInfo) {
        dispatch(walletConnectProposalApprovalFailed(t('Could not find chain requirements in WalletConnect proposal')))
        return
      }

      if (!isNetworkValid(requiredChainInfo.networkId, currentNetwork.settings.networkId)) {
        dispatch(
          walletConnectProposalApprovalFailed(
            t(
              'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
              {
                currentNetwork: currentNetwork.name,
                walletConnectNetwork: requiredChainInfo.networkId
              }
            )
          )
        )
        return
      }

      if (!isCompatibleAddressGroup(signerAddress.group, requiredChainInfo.addressGroup)) {
        dispatch(
          walletConnectProposalApprovalFailed(
            t(
              'The group of the selected address ({{ addressGroup }}) does not match the group required by WalletConnect ({{ walletConnectGroup }})',
              {
                addressGroup: signerAddress.group,
                walletConnectGroup: requiredChainInfo.addressGroup
              }
            )
          )
        )
        return
      }

      const namespaces: SessionTypes.Namespaces = {
        alephium: {
          methods: requiredNamespace.methods,
          events: requiredNamespace.events,
          accounts: [
            `${formatChain(requiredChainInfo.networkId, requiredChainInfo.addressGroup)}:${
              signerAddress.publicKey
            }/default`
          ]
        }
      }

      try {
        console.log('⏳ APPROVING PROPOSAL...')

        dispatch(toggleAppLoading(true))

        const existingSession = activeSessions.find((session) => session.peer.metadata.url === metadata.url)

        if (existingSession) {
          await walletConnectClient.disconnect({
            topic: existingSession.topic,
            reason: getSdkError('USER_DISCONNECTED')
          })
        }

        const { topic, acknowledged } = await walletConnectClient.approve({ id, relayProtocol, namespaces })
        console.log('👉 APPROVAL TOPIC RECEIVED:', topic)
        console.log('✅ APPROVING: DONE!')

        console.log('⏳ WAITING FOR DAPP ACKNOWLEDGEMENT...')
        const res = await acknowledged()
        console.log('👉 DID DAPP ACTUALLY ACKNOWLEDGE?', res.acknowledged)

        refreshActiveSessions()

        sendAnalytics({ event: 'Approved WalletConnect connection' })

        electron?.app.hide()
      } catch (e) {
        console.error('❌ WC: Error while approving and acknowledging', e)
      } finally {
        dispatch(closeModal({ id: modalId }))
        resetPendingDappConnectionUrl()
        dispatch(toggleAppLoading(false))
      }
    }

    const rejectProposal = async () => {
      if (!walletConnectClient) return

      try {
        console.log('👎 REJECTING SESSION PROPOSAL:', proposalEvent.id)
        walletConnectClient.reject({ id: proposalEvent.id, reason: getSdkError('USER_REJECTED') })
        console.log('✅ REJECTING: DONE!')

        sendAnalytics({ event: 'Rejected WalletConnect connection by clicking "Reject"' })

        electron?.app.hide()
      } catch (e) {
        console.error('❌ WC: Error while approving and acknowledging', e)
      } finally {
        dispatch(closeModal({ id: modalId }))
        resetPendingDappConnectionUrl()
      }
    }

    return (
      <CenteredModal
        id={modalId}
        title={
          metadata.description
            ? t('Connect to {{ dAppUrl }}', { dAppUrl: cleanUrl(metadata.url) })
            : t('Connect to dApp')
        }
        subtitle={metadata.description || metadata.url}
        onClose={rejectAndCloseModal}
        Icon={() =>
          metadata?.icons &&
          metadata.icons.length > 0 &&
          metadata.icons[0] && <AssetLogo assetImageUrl={metadata.icons[0]} size={50} />
        }
      >
        {showNetworkWarning ? (
          <>
            <Section>
              <InfoBox label="Switch network" Icon={AlertTriangle}>
                <Trans
                  t={t}
                  i18nKey="walletConnectSwitchNetwork"
                  values={{ currentNetworkName, network: requiredChainInfo?.networkId }}
                  components={{ 1: <Highlight /> }}
                >
                  {
                    'You are currently connected to <1>{{ currentNetworkName }}</1>, but the dApp requires a connection to <1>{{ network }}</1>.'
                  }
                </Trans>
              </InfoBox>
            </Section>
            <ModalFooterButtons>
              <ModalFooterButton role="secondary" onClick={() => rejectAndCloseModal(true)}>
                {t('Decline')}
              </ModalFooterButton>
              <ModalFooterButton onClick={handleSwitchNetworkPress}>{t('Switch network')}</ModalFooterButton>
            </ModalFooterButtons>
          </>
        ) : !signerAddress ? (
          <>
            <Section>
              <InfoBox label="New address needed" Icon={PlusSquare}>
                <Trans
                  t={t}
                  i18nKey="walletConnectNewAddress"
                  values={{ group: requiredChainInfo?.addressGroup }}
                  components={{ 1: <Highlight /> }}
                >
                  {
                    'The dApp asks for an address in group <1>{{ currentNetworkName }}</1>. Click below to generate one!'
                  }
                </Trans>
              </InfoBox>
            </Section>
            <ModalFooterButtons>
              <ModalFooterButton role="secondary" onClick={() => rejectAndCloseModal(true)}>
                {t('Decline')}
              </ModalFooterButton>
              <ModalFooterButton onClick={generateAddressInGroup}>{t('Generate new address')}</ModalFooterButton>
            </ModalFooterButtons>
          </>
        ) : (
          <>
            <Paragraph style={{ marginBottom: 0 }}>
              {group === undefined ? (
                <Trans
                  t={t}
                  i18nKey="walletConnectProposalMessage"
                  values={{ dAppUrl: cleanUrl(metadata.url) }}
                  components={{ 1: <Highlight /> }}
                >
                  {'Connect to <1>{{ dAppUrl }}</1> with one of your addresses:'}
                </Trans>
              ) : (
                <Trans
                  t={t}
                  i18nKey="walletConnectProposalMessageWithGroup"
                  values={{ dAppUrl: cleanUrl(metadata.url), group }}
                  components={{ 1: <Highlight /> }}
                >
                  {'Connect to <1>{{ dAppUrl }}</1> with one of your addresses in group <1>{{ group }}</1>:'}
                </Trans>
              )}
            </Paragraph>
            <AddressSelect
              label={t('Connect with address')}
              title={t('Select an address to connect with.')}
              addressOptions={addressesInGroup}
              defaultAddress={signerAddressHash}
              onAddressChange={setSignerAddressHash}
              id="from-address"
            />
            <ModalFooterButtons>
              <ModalFooterButton role="secondary" onClick={() => rejectAndCloseModal(true)}>
                {t('Decline')}
              </ModalFooterButton>
              <ModalFooterButton
                variant="valid"
                onClick={() => approveProposal(signerAddress)}
                disabled={!signerAddress}
              >
                {t('Accept')}
              </ModalFooterButton>
            </ModalFooterButtons>
          </>
        )}
      </CenteredModal>
    )
  }
)

export default WalletConnectSessionProposalModal

const Highlight = styled.span`
  color: ${({ theme }) => theme.global.accent};
`
