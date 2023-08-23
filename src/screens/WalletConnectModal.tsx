/*
Copyright 2018 - 2022 The Alephium Authors
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

import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import HighlightRow from '~/components/HighlightRow'
import BoxSurface from '~/components/layout/BoxSurface'
import { Modal, ModalProps } from '~/components/layout/Modals'
import { BottomModalScreenTitle, BottomScreenSection, ScreenProps, ScreenSection } from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import { useWalletConnectContext } from '~/contexts/WalletConnectContext'

interface WalletConnectModalProps extends ModalProps<ScreenProps> {
  rejectProposal: () => Promise<void>
}

const WalletConnectModal = ({ onClose, rejectProposal, ...props }: WalletConnectModalProps) => {
  const { proposalEvent, requiredChainInfo } = useWalletConnectContext()
  const posthog = usePostHog()
  const [rejecting, setRejecting] = useState(false)

  const metadata = proposalEvent?.params.proposer.metadata

  const handleReject = async () => {
    setRejecting(true)
    await rejectProposal()
    setRejecting(false)
    onClose && onClose()

    posthog?.capture('WC: Rejected WalletConnect connection by clicking "Reject"')
  }

  return (
    <Modal {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Connect to dApp</BottomModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <BoxSurface>
          <HighlightRow title="Name">
            <AppText>{metadata?.name}</AppText>
          </HighlightRow>
          <HighlightRow title="Description">
            <AppText>{metadata?.description}</AppText>
          </HighlightRow>
          <HighlightRow title="URL">
            <AppText>{metadata?.url}</AppText>
          </HighlightRow>
          <HighlightRow title="Network">
            <AppText>{requiredChainInfo?.networkId}</AppText>
          </HighlightRow>
          <HighlightRow title="Name">
            <AppText>{metadata?.name}</AppText>
          </HighlightRow>
        </BoxSurface>
      </ScreenSection>
      <BottomScreenSection>
        <ButtonsRow>
          <Button title="Decline" variant="alert" onPress={handleReject} />
          <Button title="Accept" variant="valid" onPress={() => console.log('approve')} />
        </ButtonsRow>
      </BottomScreenSection>
      <SpinnerModal isActive={rejecting} text="Rejecting connection..." />
    </Modal>
  )
}

export default WalletConnectModal
