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
import { getHumanReadableError } from '@alephium/shared'
import { AlertOctagon, AlertTriangle, Download, FileCode, TerminalSquare } from 'lucide-react'
import { usePostHog } from 'posthog-js/react'
import { useState } from 'react'
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
import PasswordConfirmation from '@/components/PasswordConfirmation'
import Table from '@/components/Table'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal from '@/modals/CenteredModal'
import ModalPortal from '@/modals/ModalPortal'
import SendModalCallContact from '@/modals/SendModals/CallContract'
import SendModalDeployContract from '@/modals/SendModals/DeployContract'
import { selectAllAddresses, selectDefaultAddress } from '@/storage/addresses/addressesSelectors'
import { copiedToClipboard, copyToClipboardFailed, receiveTestnetTokens } from '@/storage/global/globalActions'
import { devToolsToggled } from '@/storage/settings/settingsActions'
import { Address } from '@/types/addresses'

const DevToolsSettingsSection = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const addresses = useAppSelector(selectAllAddresses)
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const currentNetwork = useAppSelector((s) => s.network)
  const faucetCallPending = useAppSelector((s) => s.global.faucetCallPending)
  const devTools = useAppSelector((state) => state.settings.devTools)
  const posthog = usePostHog()

  const [isDeployContractSendModalOpen, setIsDeployContractSendModalOpen] = useState(false)
  const [isCallScriptSendModalOpen, setIsCallScriptSendModalOpen] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<Address>()

  const toggleDevTools = () => {
    dispatch(devToolsToggled())

    posthog.capture('Enabled dev tools')
  }

  const confirmAddressPrivateKeyCopyWithPassword = (address: Address) => {
    setIsPasswordModalOpen(true)
    setSelectedAddress(address)
  }

  const copyPrivateKey = async () => {
    if (!selectedAddress) return

    try {
      await navigator.clipboard.writeText(keyring.exportPrivateKeyOfAddress(selectedAddress.hash))
      dispatch(copiedToClipboard(t('Private key copied.')))

      posthog.capture('Copied address private key')
    } catch (e) {
      dispatch(copyToClipboardFailed(getHumanReadableError(e, t('Could not copy private key.'))))
      posthog.capture('Error', { message: 'Could not copy private key' })
    } finally {
      closePasswordModal()
    }
  }

  const copyPublicKey = async (address: Address) => {
    try {
      await navigator.clipboard.writeText(address.publicKey)
      dispatch(copiedToClipboard(t('Public key copied.')))

      posthog.capture('Copied address public key')
    } catch (e) {
      dispatch(copyToClipboardFailed(getHumanReadableError(e, t('Could not copy public key.'))))
      posthog.capture('Error', { message: 'Could not copy public key' })
    }
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setSelectedAddress(undefined)
  }

  const handleFaucetCall = () => {
    defaultAddress && dispatch(receiveTestnetTokens(defaultAddress?.hash))
    posthog.capture('Requested testnet tokens')
  }

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
              {t('Testnet faucet')}
            </h2>
            <Paragraph>{t('Receive testnet tokens in your default address.')}</Paragraph>
            {currentNetwork.name !== 'testnet' && (
              <InfoBox
                importance="accent"
                Icon={AlertOctagon}
                text={t(
                  'You are currently connected to the {{ currentNetwork }} network. Make sure to connect to the testnet network to see your tokens.',
                  { currentNetwork: currentNetwork.name }
                )}
              />
            )}
            <Button Icon={Download} onClick={handleFaucetCall} role="secondary" loading={faucetCallPending} wide>
              {t('Receive testnet tokens')}
            </Button>
          </Section>
          <Section align="flex-start" inList>
            <h2 tabIndex={0} role="label">
              {t('Smart contracts')}
            </h2>
            <ButtonsRow>
              <Button Icon={FileCode} onClick={() => setIsDeployContractSendModalOpen(true)} role="secondary">
                {t('Deploy contract')}
              </Button>
              <Button Icon={TerminalSquare} onClick={() => setIsCallScriptSendModalOpen(true)} role="secondary">
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
                <AddressRow address={address} disableAddressCopy key={address.hash}>
                  <Buttons>
                    <ButtonStyled role="secondary" short onClick={() => copyPublicKey(address)}>
                      {t('Public key')}
                    </ButtonStyled>
                    <ButtonStyled
                      role="secondary"
                      short
                      onClick={() => confirmAddressPrivateKeyCopyWithPassword(address)}
                    >
                      {t('Private key')}
                    </ButtonStyled>
                  </Buttons>
                </AddressRow>
              ))}
            </Table>
          </PrivateKeySection>
        </>
      )}
      <ModalPortal>
        {isDeployContractSendModalOpen && defaultAddress && (
          <SendModalDeployContract
            initialTxData={{ fromAddress: defaultAddress }}
            onClose={() => setIsDeployContractSendModalOpen(false)}
          />
        )}
        {isCallScriptSendModalOpen && defaultAddress && (
          <SendModalCallContact
            initialTxData={{ fromAddress: defaultAddress }}
            onClose={() => setIsCallScriptSendModalOpen(false)}
          />
        )}
        {isPasswordModalOpen && (
          <CenteredModal title={t('Enter password')} onClose={closePasswordModal} skipFocusOnMount>
            <PasswordConfirmation
              text={t('Enter your password to copy the private key.')}
              buttonText={t('Copy private key')}
              onCorrectPasswordEntered={copyPrivateKey}
            >
              <InfoBox importance="alert" Icon={AlertTriangle}>
                {`${t('This is a feature for developers only.')} ${t(
                  'You will not be able to recover your account with the private key!'
                )} ${t('Please, backup your secret phrase instead.')} ${t('Never disclose this key.')} ${t(
                  'Anyone with your private keys can steal any assets held in your addresses.'
                )}`}
              </InfoBox>
            </PasswordConfirmation>
          </CenteredModal>
        )}
      </ModalPortal>
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
