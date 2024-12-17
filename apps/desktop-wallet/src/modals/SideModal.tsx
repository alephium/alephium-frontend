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

import { colord } from 'colord'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { normalTransition } from '@/animations'
import Button from '@/components/Button'
import Scrollbar from '@/components/Scrollbar'
import { closeModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import ModalContainer, { ModalContainerProps } from '@/modals/ModalContainer'

export interface SideModalProps extends ModalContainerProps {
  title: string
  header?: ReactNode
  width?: number
  hideHeader?: boolean
}

const SideModal = ({
  id,
  onClose,
  children,
  title,
  header,
  width = 500,
  hideHeader,
  onAnimationComplete
}: SideModalProps) => {
  const { t } = useTranslation()
  const elRef = useFocusOnMount<HTMLDivElement>()
  const dispatch = useAppDispatch()

  const _onClose = id ? () => dispatch(closeModal({ id })) : onClose

  return (
    <ModalContainer id={id} onClose={_onClose}>
      <Sidebar
        role="dialog"
        initial={{ x: 10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 10, opacity: 0 }}
        {...normalTransition}
        width={width}
        onAnimationComplete={onAnimationComplete}
      >
        <Scrollbar>
          <ContentContainer ref={elRef} tabIndex={0} aria-label={title}>
            {children}
          </ContentContainer>
        </Scrollbar>
        {!hideHeader && (
          <ModalHeader>
            <HeaderColumn>{header ?? <Title>{title}</Title>}</HeaderColumn>
            <CloseButton aria-label={t('Close')} circle role="secondary" onClick={_onClose} Icon={X} tiny />
          </ModalHeader>
        )}
      </Sidebar>
    </ModalContainer>
  )
}

export default SideModal

const Sidebar = styled(motion.div)<{ width: number }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: ${({ width }) => width}px;
  max-height: 95vh;
  background-color: ${({ theme }) => theme.bg.background2};
  position: relative;
  margin: 25px 20px 25px auto;
  border-radius: var(--radius-huge);
  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  overflow: hidden;
`

const ModalHeader = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  padding: 0 10px 16px 20px;
  height: 70px;
  background: ${({ theme }) => `linear-gradient(to bottom, ${colord(theme.bg.background2).toHex()} 55%, transparent)`};
`

const HeaderColumn = styled.div`
  flex-grow: 1;
`

const CloseButton = styled(Button)`
  color: ${({ theme }) => theme.font.primary};
  flex-shrink: 0;
`

const Title = styled.div`
  font-weight: var(--fontWeight-semiBold);
  font-size: 15px;
`

const ContentContainer = styled.div`
  padding-top: 50px;
`
