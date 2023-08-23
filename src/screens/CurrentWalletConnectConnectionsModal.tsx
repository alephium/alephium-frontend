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

import { Image } from 'react-native'
import styled from 'styled-components/native'

import { ModalProps, ScrollModal } from '~/components/layout/Modals'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import ListItem from '~/components/ListItem'
import { useWalletConnectContext } from '~/contexts/WalletConnectContext'

type CurrentWalletConnectConnectionsModalProps = ModalProps<ScrollScreenProps>

const CurrentWalletConnectConnectionsModal = ({ onClose, ...props }: CurrentWalletConnectConnectionsModalProps) => {
  const { connectedDAppMetadata } = useWalletConnectContext()

  return (
    <ScrollModal {...props}>
      <ScreenSection>
        <BottomModalScreenTitle>Current connections</BottomModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <ListItem
          title={connectedDAppMetadata?.name ?? ''}
          subtitle={connectedDAppMetadata?.description}
          icon={<DAppIcon source={{ uri: connectedDAppMetadata?.icons[0] }} />}
        />
      </ScreenSection>
    </ScrollModal>
  )
}

export default CurrentWalletConnectConnectionsModal

const DAppIcon = styled(Image)`
  width: 50px;
  height: 50px;
`
