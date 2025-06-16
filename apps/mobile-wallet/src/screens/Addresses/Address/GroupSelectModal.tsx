import { TOTAL_NUMBER_OF_GROUPS } from '@alephium/web3'
import { map } from 'lodash'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import RadioButtonRow from '~/components/RadioButtonRow'
import i18n from '~/features/localization/i18n'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'

interface GroupSelectModalProps {
  selectedGroup?: number
  onSelect: (group?: number) => void
}

const groupSelectOptions = map(Array(TOTAL_NUMBER_OF_GROUPS + 1), (_, i) => ({
  value: i === 0 ? undefined : i - 1,
  label: i === 0 ? i18n.t('Default') : i18n.t('Group {{ groupNumber }}', { groupNumber: i - 1 })
}))

const GroupSelectModal = memo<GroupSelectModalProps & ModalBaseProp>(({ onSelect, selectedGroup }) => {
  const { dismissModal } = useModalContext()
  const { t } = useTranslation()

  const onGroupSelect = (group?: number) => {
    onSelect(group)
    dismissModal()
  }

  return (
    <BottomModal2 notScrollable title={t('Address group')}>
      {groupSelectOptions.map((groupOption, index) => (
        <RadioButtonRow
          key={groupOption.label}
          title={groupOption.label}
          onPress={() => onGroupSelect(groupOption.value)}
          isActive={selectedGroup === groupOption.value}
          isLast={index === groupSelectOptions.length - 1}
        />
      ))}
    </BottomModal2>
  )
})

export default GroupSelectModal
