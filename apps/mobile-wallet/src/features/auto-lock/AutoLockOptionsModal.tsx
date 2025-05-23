import { useTranslation } from 'react-i18next'

import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import { autoLockSecondsOptions } from '~/features/auto-lock/utils'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { autoLockSecondsChanged } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const AutoLockOptionsModal = withModal(({ id }) => {
  const { t } = useTranslation()
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()

  const handleAutoLockChange = (seconds: number) => {
    dispatch(autoLockSecondsChanged(seconds))
    dispatch(closeModal({ id }))
  }

  return (
    <BottomModal modalId={id} title={t('Auto-lock')}>
      <ScreenSection>
        <Surface>
          {autoLockSecondsOptions.map((autoLockOption, index) => (
            <RadioButtonRow
              key={autoLockOption.label}
              title={autoLockOption.label}
              onPress={() => handleAutoLockChange(autoLockOption.value)}
              isActive={autoLockSeconds === autoLockOption.value}
              isLast={index === autoLockSecondsOptions.length - 1}
            />
          ))}
        </Surface>
      </ScreenSection>
    </BottomModal>
  )
})

export default AutoLockOptionsModal
