import { keyring } from '@alephium/keyring'
import {
  AddressHash,
  isNetworkValid,
  networkSettingsPresets,
  newAddressesSaved,
  selectAddressesInGroup,
  selectDefaultAddressHash,
  WalletConnectSessionProposalModalProps
} from '@alephium/shared'
import { useUnsortedAddresses, useWalletConnectNetwork } from '@alephium/shared-react'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { SessionTypes } from '@walletconnect/types'
import { getSdkError } from '@walletconnect/utils'
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
import useWalletConnectToasts from '~/contexts/walletConnect/useWalletConnectToasts'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import usePersistAddressSettings from '~/hooks/layout/usePersistAddressSettings'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { getAddressAsymetricKey, initializeKeyringWithStoredWallet } from '~/persistent-storage/wallet'
import { VERTICAL_GAP } from '~/style/globalStyle'
import { getRandomLabelColor } from '~/utils/colors'
import { showToast } from '~/utils/layout'

const WalletConnectSessionProposalModal = withModal<WalletConnectSessionProposalModalProps>(
  ({
    id: modalId,
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
    const addresses = useUnsortedAddresses()
    const dispatch = useAppDispatch()
    const group = chainInfo.addressGroup
    const addressesInGroup = useAppSelector((s) => selectAddressesInGroup(s, group))
    const defaultAddressHash = useAppSelector(selectDefaultAddressHash)
    const currentAddressIndexes = useRef(addresses.map(({ index }) => index))
    const persistAddressSettings = usePersistAddressSettings()
    const { t } = useTranslation()
    const { walletConnectClient, activeSessions, refreshActiveSessions } = useWalletConnectContext()
    const { showApprovedToast, showRejectedToast } = useWalletConnectToasts()
    const { dismiss } = useBottomSheetModal()

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

    const handleAddressGeneratePress = async () => {
      dispatch(activateAppLoading(t('Generating new address')))

      try {
        await initializeKeyringWithStoredWallet()
        const newAddress = {
          ...keyring.generateAndCacheAddress({ group, skipAddressIndexes: currentAddressIndexes.current }),
          label: '',
          color: getRandomLabelColor(),
          isDefault: false
        }

        await persistAddressSettings(newAddress)
        dispatch(newAddressesSaved([newAddress]))

        sendAnalytics({ event: 'WC: Generated new address' })
      } catch (error) {
        sendAnalytics({ type: 'error', error, message: 'WC: Could not save new address' })
      } finally {
        keyring.clear()
      }

      dispatch(deactivateAppLoading())
    }

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
        dismiss()
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
        dismiss()
      }
    }

    return (
      <BottomModal2 modalId={modalId} title={t('Connect to dApp')} contentVerticalGap>
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
                      requiredNetwork: chainInfo.networkId
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
                <Button title={t('Generate new address')} variant="accent" onPress={handleAddressGeneratePress} flex />
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
