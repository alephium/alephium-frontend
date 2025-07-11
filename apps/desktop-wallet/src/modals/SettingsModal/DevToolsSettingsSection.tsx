import { Address, AddressHash, getHumanReadableError, selectDefaultAddress } from '@alephium/shared'
import { useUnsortedAddresses } from '@alephium/shared-react'
import { getHDWalletPath } from '@alephium/web3-wallet'
import { AlertOctagon, Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressRow from '@/components/AddressRow'
import Box from '@/components/Box'
import Button from '@/components/Button'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import InfoBox from '@/components/InfoBox'
import InlineLabelValueInput from '@/components/Inputs/InlineLabelValueInput'
import Toggle from '@/components/Inputs/Toggle'
import { Section } from '@/components/PageComponents/PageContainers'
import Paragraph from '@/components/Paragraph'
import Table from '@/components/Table'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { openModal } from '@/features/modals/modalActions'
import { devToolsToggled } from '@/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { copiedToClipboard, copyToClipboardFailed, receiveFaucetTokens } from '@/storage/global/globalActions'

const DevToolsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const devTools = useAppSelector((state) => state.settings.devTools)

  const toggleDevTools = () => {
    dispatch(devToolsToggled())

    sendAnalytics({ event: 'Enabled dev tools' })
  }

  return (
    <>
      <Section align="flex-start">
        <Box>
          <InlineLabelValueInput
            label={t('Enable developer tools')}
            description={t('Features for developers only')}
            InputComponent={<Toggle label={t('Enable developer tools')} toggled={devTools} onToggle={toggleDevTools} />}
            noHorizontalPadding
          />
          <HorizontalDivider />
        </Box>
      </Section>
      {devTools && (
        <>
          <FaucetSection />

          <KeyPairsSection />
        </>
      )}
    </>
  )
}

export default DevToolsSettingsSection

const FaucetSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const currentNetwork = useAppSelector((s) => s.network)
  const faucetCallPending = useAppSelector((s) => s.global.faucetCallPending)

  const handleFaucetCall = () => {
    defaultAddress && dispatch(receiveFaucetTokens(defaultAddress.hash))
    sendAnalytics({ event: 'Requested testnet tokens' })
  }

  const isOnTestNetwork = ['testnet', 'devnet'].includes(currentNetwork.name)

  return (
    <Section align="flex-start" inList>
      <h2 tabIndex={0} role="label">
        {t('Token faucet')}
      </h2>
      <Paragraph>{t('Receive test tokens in your default address.')}</Paragraph>
      {!isOnTestNetwork && (
        <InfoBox
          importance="accent"
          Icon={AlertOctagon}
          text={t(
            'You are currently connected to the {{ currentNetwork }} network. Make sure to connect to the testnet or devnet network to see your tokens.',
            { currentNetwork: currentNetwork.name }
          )}
        />
      )}
      {isOnTestNetwork && (
        <Button Icon={Download} onClick={handleFaucetCall} role="secondary" loading={faucetCallPending} wide>
          {t('Receive test tokens')}
        </Button>
      )}
    </Section>
  )
}

const KeyPairsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const addresses = useUnsortedAddresses()
  const { isLedger } = useLedger()
  const { sendAnalytics } = useAnalytics()

  const openCopyPrivateKeyConfirmationModal = (addressHash: AddressHash) =>
    dispatch(openModal({ name: 'CopyPrivateKeyConfirmationModal', props: { addressHash } }))

  const copyPublicKey = async (address: Address) => {
    try {
      await navigator.clipboard.writeText(address.publicKey)
      dispatch(copiedToClipboard(t('Public key copied.')))

      sendAnalytics({ event: 'Copied address public key' })
    } catch (error) {
      dispatch(copyToClipboardFailed(getHumanReadableError(error, t('Could not copy public key.'))))
      sendAnalytics({ type: 'error', message: 'Could not copy public key' })
    }
  }

  return (
    <PrivateKeySection align="flex-start" role="list">
      <h2 tabIndex={0} role="label">
        {t('Address keys export')}
      </h2>
      <Paragraph>{t('Copy the keys of an address.')}</Paragraph>
      <Table>
        {addresses.map((address) => (
          <AddressRow
            addressHash={address.hash}
            key={address.hash}
            subtitle={getHDWalletPath(address.keyType ?? 'default', address.index)}
          >
            <Buttons>
              <ButtonStyled role="secondary" short onClick={() => copyPublicKey(address)}>
                {t('Public key')}
              </ButtonStyled>
              {!isLedger && (
                <ButtonStyled role="secondary" short onClick={() => openCopyPrivateKeyConfirmationModal(address.hash)}>
                  {t('Private key')}
                </ButtonStyled>
              )}
            </Buttons>
          </AddressRow>
        ))}
      </Table>
    </PrivateKeySection>
  )
}

const PrivateKeySection = styled(Section)`
  margin-top: var(--spacing-3);
`

const ButtonStyled = styled(Button)`
  margin: 0;
`

const Buttons = styled.div`
  display: flex;
  gap: 10px;
  margin-left: auto;
`
