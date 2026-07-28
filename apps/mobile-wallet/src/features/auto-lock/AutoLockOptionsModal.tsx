import { AnalyticsEvent } from '@alephium/shared'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import RadioButtonRow from '~/components/RadioButtonRow'
import { useAutoLockSecondsOptions } from '~/features/auto-lock/utils'
import BottomModal from '~/features/modals/BottomModal'
import { useModalContext } from '~/features/modals/ModalContext'
import { autoLockSecondsChanged } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const AutoLockOptionsModal = memo(() => {
  const { t } = useTranslation()
  const autoLockSeconds = useAppSelector((s) => s.settings.autoLockSeconds)
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()
  const autoLockSecondsOptions = useAutoLockSecondsOptions()

  const handleAutoLockChange = (seconds: number) => {
    dispatch(autoLockSecondsChanged(seconds))
    sendAnalytics({ event: AnalyticsEvent.AUTO_LOCK_CHANGED, props: { auto_lock_seconds: seconds } })
    dismissModal()
  }

  return (
    <BottomModal notScrollable title={t('Auto-lock')}>
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
