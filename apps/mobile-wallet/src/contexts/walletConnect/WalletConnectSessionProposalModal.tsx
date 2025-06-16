import {
  AddressHash,
  isNetworkValid,
  networkSettingsPresets,
  selectAddressesInGroup,
  selectDefaultAddressHash,
  WalletConnectSessionProposalModalProps
} from '@alephium/shared'
import { useWalletConnectNetwork } from '@alephium/shared-react'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
import { memo, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AddressBox from '~/components/AddressBox'
import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import useWalletConnectToasts from '~/contexts/walletConnect/useWalletConnectToasts'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import ConnectDappModalHeader from '~/features/ecosystem/modals/ConnectDappModalHeader'
import ConnectDappNewAddressModalContent from '~/features/ecosystem/modals/ConnectDappNewAddressModalContent'
import NetworkSwitchModalContent from '~/features/ecosystem/modals/NetworkSwitchModalContent'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { showToast } from '~/utils/layout'

const WalletConnectSessionProposalModal = memo<WalletConnectSessionProposalModalProps>(
  ({
    proposalEventId,
    relayProtocol,
    requiredNamespaceMethods,
    requiredNamespaceEvents,
    metadata,
    chainInfo,
    chain
  }) => {
    const currentNetworkId = useAppSelector((s) => s.network.settings.networkId)
    const currentNetworkName = useAppSelector((s) => s.network.name)
    const dispatch = useAppDispatch()
    const group = chainInfo.addressGroup
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
    const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
    const { t } = useTranslation()
    const { walletConnectClient, activeSessions, refreshActiveSessions } = useWalletConnectContext()
    const { showApprovedToast, showRejectedToast } = useWalletConnectToasts()
    const { dismissModal } = useModalContext()

    const [signerAddress, setSignerAddress] = useState<AddressHash>()
    const [showAlternativeSignerAddresses, setShowAlternativeSignerAddresses] = useState(false)

    const { handleSwitchNetworkPress, showNetworkWarning } = useWalletConnectNetwork(chainInfo.networkId, () =>
      persistSettings('network', networkSettingsPresets[chainInfo.networkId])
    )

    useEffect(() => {
      setSignerAddress(
        addressesInGroup.length > 0
          ? addressesInGroup.find((a) => a === defaultAddressHash) ?? addressesInGroup.at(0)
          : undefined
      )
    }, [addressesInGroup, defaultAddressHash])

    const handleApproveProposal = async (signerAddressHash: AddressHash) => {
      console.log('👍 USER APPROVED PROPOSAL TO CONNECT TO THE DAPP.')
      console.log('⏳ VERIFYING USER PROVIDED DATA...')

      if (!walletConnectClient) {
        console.error('❌ Could not find WalletConnect client')
        return
      }

      if (!isNetworkValid(chainInfo.networkId, currentNetworkId)) {
        console.error(
          `❌ WalletConnect requested the ${chainInfo.networkId} network, but the current network is ${currentNetworkName}.`
        )
        return showToast({
          text1: t('Could not approve'),
          text2: t(
            'WalletConnect requested the {{ requestedNetwork }} network, but the current network is {{ currentNetwork }}.',
            { requestedNetwork: chainInfo.networkId, currentNetwork: currentNetworkName }
          ),
          type: 'error',
          autoHide: false
        })
      }

      console.log('✅ VERIFIED USER PROVIDED DATA!')

      try {
        dispatch(activateAppLoading(t('Approving')))
        console.log('⏳ APPROVING PROPOSAL...')

        const existingSession = activeSessions.find((session) => session.peer.metadata.url === metadata.url)

        if (existingSession) {
          await walletConnectClient.disconnectSession({
            topic: existingSession.topic,
            reason: getSdkError('USER_DISCONNECTED')
          })
        }

        const publicKey = await getAddressAsymetricKey(signerAddressHash, 'public')

        const namespaces: SessionTypes.Namespaces = {
          alephium: {
            methods: requiredNamespaceMethods,
            events: requiredNamespaceEvents,
            accounts: [`${chain}:${publicKey}/default`]
          }
        }

        const { topic, acknowledged } = await walletConnectClient.approveSession({
          id: proposalEventId,
          relayProtocol,
          namespaces
        })
        console.log('👉 APPROVAL TOPIC RECEIVED:', topic)
        console.log('✅ APPROVING: DONE!')
        console.log('👉 DID DAPP ACTUALLY ACKNOWLEDGE?', acknowledged)

        sendAnalytics({ event: 'WC: Approved connection' })
      } catch (e) {
        console.error('❌ WC: Error while approving and acknowledging', e)
      } finally {
        refreshActiveSessions()
        dispatch(deactivateAppLoading())
        showApprovedToast()
        dismissModal()
      }
    }

    const handleRejectProposal = async () => {
      if (!walletConnectClient) return

      try {
        dispatch(activateAppLoading(t('Rejecting')))
        console.log('👎 REJECTING SESSION PROPOSAL:', proposalEventId)
        await walletConnectClient.rejectSession({ id: proposalEventId, reason: getSdkError('USER_REJECTED') })
        console.log('✅ REJECTING: DONE!')
      } catch (e) {
        console.error('❌ WC: Error while rejecting', e)
      } finally {
        refreshActiveSessions()
        dispatch(deactivateAppLoading())
        showRejectedToast()
        dismissModal()
      }
    }

    return (
      <BottomModal2 title={t('Connect to dApp')} contentVerticalGap>
        <ConnectDappModalHeader
          dAppName={metadata?.description}
          dAppUrl={metadata?.url}
          dAppIcon={metadata?.icons?.[0]}
        />

        {showNetworkWarning ? (
          <NetworkSwitchModalContent
            currentNetworkName={currentNetworkName}
            requiredNetworkName={chainInfo.networkId}
            onSwitchNetworkPress={handleSwitchNetworkPress}
            onDeclinePress={handleRejectProposal}
          />
        ) : !signerAddress ? (
          <ConnectDappNewAddressModalContent group={group} onDeclinePress={handleRejectProposal} />
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
                  {addressesInGroup.map((addressHash, i) => (
                    <AddressBox
                      key={addressHash}
                      addressHash={addressHash}
                      isSelected={addressHash === signerAddress}
                      onPress={() => {
                        setSignerAddress(addressHash)
                        setShowAlternativeSignerAddresses(false)
                        sendAnalytics({ event: 'WC: Switched signer address' })
                      }}
                      isLast={i === addressesInGroup.length - 1}
                      origin="walletConnectPairing"
                    />
                  ))}
                </AddressList>
              </ScreenSection>
            ) : (
              <ScreenSection>
                <SectionTitle semiBold>{t('Connect with address')}</SectionTitle>
                <SectionSubtitle color="secondary">{t('Tap to change the address to connect with.')}</SectionSubtitle>
                <AddressList>
                  <AddressBox
                    addressHash={signerAddress}
                    onPress={() => setShowAlternativeSignerAddresses(true)}
                    isSelected
                    isLast
                    rounded
                    origin="walletConnectPairing"
                  />
                </AddressList>
              </ScreenSection>
            )}

            <BottomButtons backgroundColor="back1">
              <Button title={t('Decline')} variant="alert" onPress={handleRejectProposal} flex wide />
              <Button
                title={t('Accept')}
                variant="valid"
                onPress={() => handleApproveProposal(signerAddress)}
                disabled={!signerAddress}
                flex
              />
            </BottomButtons>
          </>
        )}
      </BottomModal2>
    )
  }
)

export default WalletConnectSessionProposalModal

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
