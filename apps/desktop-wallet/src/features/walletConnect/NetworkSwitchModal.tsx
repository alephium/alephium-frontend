import { useWalletConnectNetwork } from '@alephium/shared-react'
import { ChainInfo } from '@alephium/walletconnect-provider'
import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'

export interface NetworkSwitchModalProps {
  networkId: ChainInfo['networkId']
}

const NetworkSwitchModal = memo(({ id, networkId }: NetworkSwitchModalProps & ModalBaseProp) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleClose = () => dispatch(closeModal({ id }))

  return (
    <CenteredModal title={t('Network mismatch')} id={id} hasFooterButtons>
      <NetworkSwitchModalContent networkId={networkId} onUserDismiss={handleClose} onSwitchNetwork={handleClose} />
    </CenteredModal>
  )
})

export default NetworkSwitchModal

interface NetworkSwitchModalContentProps extends NetworkSwitchModalProps {
  onUserDismiss: () => void
  onSwitchNetwork?: () => void
}

export const NetworkSwitchModalContent = ({
  networkId,
  onUserDismiss,
  onSwitchNetwork
}: NetworkSwitchModalContentProps) => {
  const { t } = useTranslation()
  const { handleSwitchNetworkPress } = useWalletConnectNetwork(networkId)
  const currentNetworkName = useAppSelector((s) => s.network.name)

  const handleNetworkSwitch = () => {
    handleSwitchNetworkPress()
    onSwitchNetwork?.()
  }

  return (
    <>
      <Section>
        <InfoBox label={t('Switch network')} Icon={AlertTriangle}>
          <Trans
            t={t}
            i18nKey="walletConnectSwitchNetwork"
            values={{ currentNetworkName, network: networkId }}
            components={{ 1: <Highlight /> }}
          >
            {
              'You are currently connected to <1>{{ currentNetworkName }}</1>, but the dApp requires a connection to <1>{{ network }}</1>.'
            }
          </Trans>
        </InfoBox>
      </Section>
      <ModalFooterButtons>
        <ModalFooterButton role="secondary" onClick={onUserDismiss}>
          {t('Decline')}
        </ModalFooterButton>
        <ModalFooterButton onClick={handleNetworkSwitch}>{t('Switch network')}</ModalFooterButton>
      </ModalFooterButtons>
    </>
  )
}

const Highlight = styled.span`
  color: ${({ theme }) => theme.global.accent};
`
