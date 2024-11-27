/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { motion } from 'framer-motion'
import { Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import { appHeaderHeightPx, walletSidebarWidthPx } from '@/style/globalStyles'
import { useWindowSize } from '@/utils/hooks'

interface SideBarProps {
  renderTopComponent: (isExpanded: boolean) => ReactNode
  noExpansion?: boolean
  className?: string
}

const SideBar = ({ renderTopComponent, noExpansion, className }: SideBarProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { width: windowWidth } = useWindowSize()

  const openSettingsModal = () => dispatch(openModal({ name: 'SettingsModal', props: {} }))

  const isExpanded = noExpansion ? false : windowWidth ? windowWidth > 1200 : false

  return (
    <motion.div
      className={className}
      animate={{ width: isExpanded ? walletSidebarWidthPx * 3 : walletSidebarWidthPx }}
      transition={{ delay: 1.1, type: 'spring', damping: 20 }}
    >
      {renderTopComponent(isExpanded)}
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
  align-items: center;
  z-index: 1;

  width: ${walletSidebarWidthPx}px;
  padding: ${appHeaderHeightPx - 10}px var(--spacing-4) var(--spacing-3);
`

const BottomButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`
