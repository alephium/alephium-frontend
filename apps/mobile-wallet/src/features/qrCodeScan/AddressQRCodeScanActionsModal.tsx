import { AddressHash } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import SendButton from '~/features/send/SendButton'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { selectContactByHash } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressQRCodeScanActionsModalProps {
  addressHash: AddressHash
}

const AddressQRCodeScanActionsModal = memo<AddressQRCodeScanActionsModalProps>(({ addressHash }) => {
  const contact = useAppSelector((s) => selectContactByHash(s, addressHash))
  const { dismissModal } = useModalContext()

  return (
    <BottomModal2 notScrollable noPadding title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
      <ScreenSection>
        <ActionButtons>
          <SendButton
            origin="qrCodeScan"
            destinationAddressHash={addressHash}
            onPress={dismissModal}
            buttonType="quick-action"
          />
          {!contact && <AddContactButton addressHash={addressHash} onPress={dismissModal} />}
        </ActionButtons>
      </ScreenSection>
    </BottomModal2>
  )
})

export default AddressQRCodeScanActionsModal

interface ActionButtonProps extends AddressQRCodeScanActionsModalProps {
  onPress: () => void
}

const AddContactButton = ({ addressHash, onPress }: ActionButtonProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { t } = useTranslation()

  const handlePress = () => {
    navigation.navigate('NewContactScreen', { addressHash })
    onPress()
  }

  return <QuickActionButton title={t('Add to contacts')} onPress={handlePress} iconProps={{ name: 'add' }} />
}

// TODO: DRY
const ActionButtons = styled.View`
  margin: ${VERTICAL_GAP / 2}px 0;
  gap: 10px;
`
