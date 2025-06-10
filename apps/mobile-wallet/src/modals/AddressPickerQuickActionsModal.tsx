import { AddressHash } from '@alephium/shared'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { GestureResponderEvent } from 'react-native'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import QuickActionButton from '~/components/buttons/QuickActionButton'
import { ScreenSection } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { openModal } from '~/features/modals/modalActions'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressPickerQuickActionsModalProps {
  addressHash: AddressHash
  onSelectAddress: (e: GestureResponderEvent) => void
}

const AddressPickerQuickActionsModal = memo<AddressPickerQuickActionsModalProps & ModalBaseProp>(
  ({ id, addressHash, onSelectAddress }) => {
    const { dismiss } = useBottomSheetModal()
    const { t } = useTranslation()

    const handleOpenAddressDetailsModal = () => {
      openModal({ name: 'AddressDetailsModal', props: { addressHash } })
      dismiss(id)
    }

    const handleSelectAddress = (e: GestureResponderEvent) => {
      onSelectAddress(e)
      dismiss(id)
    }

    return (
      <BottomModal2
        notScrollable
        modalId={id}
        noPadding
        title={<AddressBadge addressHash={addressHash} fontSize={16} />}
      >
        <ScreenSection>
          <ActionButtons>
            <QuickActionButton
              title={t('See address details')}
              onPress={handleOpenAddressDetailsModal}
              iconProps={{ name: 'eye-outline' }}
            />
            <QuickActionButton
              title={t('Select address')}
              onPress={handleSelectAddress}
              iconProps={{ name: 'checkmark-outline' }}
            />
          </ActionButtons>
        </ScreenSection>
      </BottomModal2>
    )
  }
)

export default AddressPickerQuickActionsModal

// TODO: DRY
const ActionButtons = styled.View`
  margin: ${VERTICAL_GAP / 2}px 0;
  gap: 10px;
`
