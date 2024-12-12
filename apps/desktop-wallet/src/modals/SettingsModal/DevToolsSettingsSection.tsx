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

import { AddressHash, getHumanReadableError } from '@alephium/shared'
import { getSecp259K1Path } from '@alephium/web3-wallet'
import { AlertOctagon, Download, FileCode, TerminalSquare } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AddressRow from '@/components/AddressRow'
import Box from '@/components/Box'
import Button from '@/components/Button'
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
import { useUnsortedAddresses } from '@/hooks/useUnsortedAddresses'
import { selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { copiedToClipboard, copyToClipboardFailed, receiveFaucetTokens } from '@/storage/global/globalActions'
import { Address } from '@/types/addresses'

const DevToolsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const addresses = useUnsortedAddresses()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const currentNetwork = useAppSelector((s) => s.network)
  const faucetCallPending = useAppSelector((s) => s.global.faucetCallPending)
  const devTools = useAppSelector((state) => state.settings.devTools)
  const { isLedger } = useLedger()
  const { sendAnalytics } = useAnalytics()

  const toggleDevTools = () => {
    dispatch(devToolsToggled())

    sendAnalytics({ event: 'Enabled dev tools' })
  }

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

  const handleFaucetCall = () => {
    defaultAddress && dispatch(receiveFaucetTokens(defaultAddress.hash))
    sendAnalytics({ event: 'Requested testnet tokens' })
  }

  const openCallContractModal = () =>
    dispatch(openModal({ name: 'CallContractSendModal', props: { initialTxData: { fromAddress: defaultAddress } } }))

  const openDeployContractModal = () =>
    dispatch(openModal({ name: 'DeployContractSendModal', props: { initialTxData: { fromAddress: defaultAddress } } }))

  const isOnTestNetwork = ['testnet', 'devnet'].includes(currentNetwork.name)

  return (
    <>
      <Section align="flex-start">
        <Box>
          <InlineLabelValueInput
            label={t('Enable developer tools')}
            description={t('Features for developers only')}
            InputComponent={<Toggle label={t('Enable developer tools')} toggled={devTools} onToggle={toggleDevTools} />}
          />
        </Box>
      </Section>
      {devTools && (
        <>
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
          <Section align="flex-start" inList>
            <h2 tabIndex={0} role="label">
              {t('Smart contracts')}
            </h2>
            <ButtonsRow>
              <Button Icon={FileCode} onClick={openDeployContractModal} role="secondary">
                {t('Deploy contract')}
              </Button>
              <Button Icon={TerminalSquare} onClick={openCallContractModal} role="secondary">
                {t('Call contract')}
              </Button>
            </ButtonsRow>
          </Section>
          <PrivateKeySection align="flex-start" role="list">
            <h2 tabIndex={0} role="label">
              {t('Address keys export')}
            </h2>
            <Paragraph>{t('Copy the keys of an address.')}</Paragraph>
            <Table>
              {addresses.map((address) => (
                <AddressRow addressHash={address.hash} key={address.hash} subtitle={getSecp259K1Path(address.index)}>
                  <Buttons>
                    <ButtonStyled role="secondary" short onClick={() => copyPublicKey(address)}>
                      {t('Public key')}
                    </ButtonStyled>
                    {!isLedger && (
                      <ButtonStyled
                        role="secondary"
                        short
                        onClick={() => openCopyPrivateKeyConfirmationModal(address.hash)}
                      >
                        {t('Private key')}
                      </ButtonStyled>
                    )}
                  </Buttons>
                </AddressRow>
              ))}
            </Table>
          </PrivateKeySection>
        </>
      )}
    </>
  )
}

export default DevToolsSettingsSection

const ButtonsRow = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  gap: var(--spacing-4);
`

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
