import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import NavItem from '@/components/NavItem'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface SideBarSettingsButtonProps {
  className?: string
}

const SideBarSettingsButton = ({ className }: SideBarSettingsButtonProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openSettingsModal = () => dispatch(openModal({ name: 'SettingsModal', props: {} }))

  return <NavItem Icon={Settings} label={t('Settings')} onClick={openSettingsModal} className={className} />
}

export default SideBarSettingsButton
