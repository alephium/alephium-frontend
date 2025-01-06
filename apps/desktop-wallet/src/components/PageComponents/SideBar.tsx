import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'

interface SideBarProps {
  animateEntry?: boolean
  className?: string
}

const SideBar: FC<SideBarProps> = ({ animateEntry, className, children }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const openSettingsModal = () => dispatch(openModal({ name: 'SettingsModal', props: {} }))

  return (
    <motion.div
      className={className}
      initial={{ x: animateEntry ? '-100%' : 0 }}
      animate={{ x: 0 }}
      transition={{ delay: 1.1, type: 'spring', damping: 20 }}
    >
      {children}
      <BottomButtons>
        <ThemeSwitcher />
        <Button
          transparent
          squared
          role="secondary"
          onClick={openSettingsModal}
          aria-label={t('Settings')}
          Icon={Settings}
          data-tooltip-id="sidenav"
          data-tooltip-content={t('Settings')}
        />
      </BottomButtons>
    </motion.div>
  )
}

export default styled(SideBar)`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  z-index: 1;

  width: ${walletSidebarWidthPx}px;
  padding: ${appHeaderHeightPx}px var(--spacing-4) var(--spacing-4);

  border-right: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => (theme.name === 'light' ? theme.bg.primary : theme.bg.background2)};
`

const BottomButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`
