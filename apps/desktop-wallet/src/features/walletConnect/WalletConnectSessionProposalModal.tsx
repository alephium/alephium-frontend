import { isNetworkValid, WalletConnectSessionProposalModalProps } from '@alephium/shared'
import { useWalletConnectNetwork } from '@alephium/shared-react'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { AlertTriangle, PlusSquare } from 'lucide-react'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import Logo from '@/components/Logo'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import useSignerAddress from '@/features/walletConnect/useSignerAddress'
import { useWalletConnectContext } from '@/features/walletConnect/walletConnectContext'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useAddressGeneration from '@/hooks/useAddressGeneration'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { saveNewAddresses } from '@/storage/addresses/addressesStorageUtils'
import { walletConnectProposalApprovalFailed } from '@/storage/dApps/dAppActions'
import { showToast, toggleAppLoading } from '@/storage/global/globalActions'
import { getRandomLabelColor } from '@/utils/colors'
import { cleanUrl } from '@/utils/misc'

const WalletConnectSessionProposalModal = memo(
  ({
    id: modalId,
    proposalEventId,
    relayProtocol,
    requiredNamespaceMethods,
    requiredNamespaceEvents,
    metadata,
    chainInfo,
    chain
  }: ModalBaseProp & WalletConnectSessionProposalModalProps) => {
    const { t } = useTranslation()
    const { sendAnalytics } = useAnalytics()
    const { walletConnectClient, resetPendingDappConnectionUrl, activeSessions, refreshActiveSessions } =
      useWalletConnectContext()
    const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
    const currentNetworkName = useAppSelector((s) => s.network.name)
    const dispatch = useAppDispatch()
    const { generateAddress } = useAddressGeneration()

    const group = chainInfo.addressGroup

    const { signerAddressHash, signerAddressPublicKey, setSignerAddressHash, addressesInGroup } =
      useSignerAddress(group)

    const { handleSwitchNetworkPress, showNetworkWarning } = useWalletConnectNetwork(chainInfo.networkId)

    const generateAddressInGroup = async () => {
      try {
        const address = await generateAddress(group)
        if (!address) return

        saveNewAddresses([{ ...address, isDefault: false, color: getRandomLabelColor() }])

        sendAnalytics({ event: 'New address created through WalletConnect modal' })
      } catch (error) {
        sendAnalytics({ type: 'error', message: 'Error while saving newly generated address from WalletConnect modal' })
        dispatch(
          showToast({ text: `${t('could_not_save_new_address_one')}: ${error}`, type: 'alert', duration: 'long' })
        )
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

    const approveProposal = async () => {
      console.log('👍 USER APPROVED PROPOSAL TO CONNECT TO THE DAPP.')
      console.log('⏳ VERIFYING USER PROVIDED DATA...')

      if (!walletConnectClient) {
        console.error('❌ Could not find WalletConnect client')
        return
      }

      if (!isNetworkValid(chainInfo.networkId, currentNetworkId)) {
        dispatch(
          walletConnectProposalApprovalFailed(
            t(
              'The current network ({{ currentNetwork }}) does not match the network requested by WalletConnect ({{ walletConnectNetwork }})',
              {
                currentNetwork: currentNetworkName,
                walletConnectNetwork: chainInfo.networkId
              }
            )
          )
        )
        return
      }

      const namespaces: SessionTypes.Namespaces = {
        alephium: {
          methods: requiredNamespaceMethods,
          events: requiredNamespaceEvents,
          accounts: [`${chain}:${signerAddressPublicKey}/default`]
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

        const { topic, acknowledged } = await walletConnectClient.approve({
          id: proposalEventId,
          relayProtocol,
          namespaces
        })
        console.log('👉 APPROVAL TOPIC RECEIVED:', topic)
        console.log('✅ APPROVING: DONE!')

        console.log('⏳ WAITING FOR DAPP ACKNOWLEDGEMENT...')
        const res = await acknowledged()
        console.log('👉 DID DAPP ACTUALLY ACKNOWLEDGE?', res.acknowledged)

        refreshActiveSessions()

        sendAnalytics({ event: 'Approved WalletConnect connection' })

        window.electron?.app.hide()
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
        console.log('👎 REJECTING SESSION PROPOSAL:', proposalEventId)
        walletConnectClient.reject({ id: proposalEventId, reason: getSdkError('USER_REJECTED') })
        console.log('✅ REJECTING: DONE!')

        sendAnalytics({ event: 'Rejected WalletConnect connection by clicking "Reject"' })

        window.electron?.app.hide()
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
          metadata.icons[0] && <Logo image={metadata.icons[0]} size={50} />
        }
      >
        {showNetworkWarning ? (
          <>
            <Section>
              <InfoBox label="Switch network" Icon={AlertTriangle}>
                <Trans
                  t={t}
                  i18nKey="walletConnectSwitchNetwork"
                  values={{ currentNetworkName, network: chainInfo.networkId }}
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
        ) : !signerAddressPublicKey ? (
          <>
            <Section>
              <InfoBox label="New address needed" Icon={PlusSquare}>
                <Trans
                  t={t}
                  i18nKey="walletConnectNewAddress"
                  values={{ currentNetworkName }}
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
              selectedAddress={signerAddressHash}
              onAddressChange={setSignerAddressHash}
              id="from-address"
            />
            <ModalFooterButtons>
              <ModalFooterButton role="secondary" onClick={() => rejectAndCloseModal(true)}>
                {t('Decline')}
              </ModalFooterButton>
              <ModalFooterButton variant="valid" onClick={approveProposal} disabled={!signerAddressPublicKey}>
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
