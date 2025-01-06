import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { map } from 'lodash'

import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import i18n from '~/features/localization/i18n'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'

interface GroupSelectModalProps {
  selectedGroup?: number
  onSelect: (group?: number) => void
}

const groupSelectOptions = map(Array(TOTAL_NUMBER_OF_GROUPS + 1), (_, i) => ({
  value: i === 0 ? undefined : i - 1,
  label: i === 0 ? i18n.t('Default') : i18n.t('Group {{ groupNumber }}', { groupNumber: i - 1 })
}))

const GroupSelectModal = withModal<GroupSelectModalProps>(({ id, onSelect, selectedGroup }) => {
  const dispatch = useAppDispatch()

  const onGroupSelect = (group?: number) => {
    onSelect(group)
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id}>
      <ModalContent>
        <ScreenSection>
          <Surface>
            {groupSelectOptions.map((groupOption, index) => (
              <RadioButtonRow
                key={groupOption.label}
                title={groupOption.label}
                onPress={() => onGroupSelect(groupOption.value)}
                isActive={selectedGroup === groupOption.value}
                isLast={index === groupSelectOptions.length - 1}
              />
            ))}
          </Surface>
        </ScreenSection>
      </ModalContent>
    </BottomModal>
  )
})

export default GroupSelectModal
