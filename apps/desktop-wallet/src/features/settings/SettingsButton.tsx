import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

const SettingsButton = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openSettingsModal = () => dispatch(openModal({ name: 'SettingsModal', props: {} }))
  return (
    <Button
      circle
      role="secondary"
      onClick={openSettingsModal}
      aria-label={t('Settings')}
      Icon={Settings}
      data-tooltip-id="sidenav"
      transparent
      data-tooltip-content={t('Settings')}
    />
  )
}

export default SettingsButton
