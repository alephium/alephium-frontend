import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import { GestureResponderEvent } from 'react-native'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressPickerQuickActionsModalProps {
  addressHash: AddressHash
  onSelectAddress: (e: GestureResponderEvent) => void
}

const AddressPickerQuickActionsModal = withModal<AddressPickerQuickActionsModalProps>(
  ({ id, addressHash, onSelectAddress }) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const handleOpenAddressDetailsModal = () => {
      dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
      dispatch(closeModal({ id }))
    }

    const handleSelectAddress = (e: GestureResponderEvent) => {
      onSelectAddress(e)
      dispatch(closeModal({ id }))
    }

    return (
      <BottomModal modalId={id} noPadding title={<AddressBadge addressHash={addressHash} fontSize={16} />}>
        <ScreenSection>
          <ActionButtons>
            <QuickActionButton
              title={t('See address details')}
              onPress={handleOpenAddressDetailsModal}
              iconProps={{ name: 'eye' }}
            />
            <QuickActionButton
              title={t('Select address')}
              onPress={handleSelectAddress}
              iconProps={{ name: 'check' }}
              isLast
            />
          </ActionButtons>
        </ScreenSection>
      </BottomModal>
    )
  }
)

export default AddressPickerQuickActionsModal

// TODO: DRY
const ActionButtons = styled.View`
  margin: ${VERTICAL_GAP / 2}px 0;
  gap: 10px;
`
