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
        initial={{ x: 30, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 30, opacity: 0 }}
        {...normalTransition}
        width={width}
        onAnimationComplete={onAnimationComplete}
      >
        {!hideHeader && (
          <ModalHeader>
            <HeaderColumn>{header ?? <Title>{title}</Title>}</HeaderColumn>
            <CloseButton aria-label={t('Close')} squared role="secondary" transparent onClick={_onClose} Icon={X} />
          </ModalHeader>
        )}
        <Scrollbar>
          <div ref={elRef} tabIndex={0} aria-label={title}>
            {children}
          </div>
        </Scrollbar>
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
  overflow: auto;
  margin: 25px 20px 25px auto;
  border-radius: var(--radius-huge);
  border: 1px solid ${({ theme }) => theme.border.primary};
  box-shadow: ${({ theme }) => theme.shadow.tertiary};
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
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
  font-size: 16px;
`
