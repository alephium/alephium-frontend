import { motion, MotionProps } from 'framer-motion'
import { KeyboardEvent, ReactNode, useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'

import { fadeInOutFast } from '@/animations'
import { closeModal } from '@/features/modals/modalActions'
import { ModalInstance } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import useFocusOnMount from '@/hooks/useFocusOnMount'
import { modalClosed, modalOpened } from '@/storage/global/globalActions'

export interface ModalContainerProps extends MotionProps {
  id?: ModalInstance['id'] // TODO: Make required when all modals have been refactored
  onClose?: () => void // TODO: Delete when all modals have been refactored
  children?: ReactNode | ReactNode[]
  focusMode?: boolean
  hasPadding?: boolean
  className?: string
  skipFocusOnMount?: boolean
}

const ModalContainer = ({ id, onClose, children, focusMode, className, skipFocusOnMount }: ModalContainerProps) => {
  const dispatch = useAppDispatch()
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()
  const modalRef = useFocusOnMount<HTMLDivElement>(skipFocusOnMount)
  const modalId = useRef<string>(`modal-${new Date().valueOf()}`)

  // TODO: Delete when onClose is deleted and id has become required
  if (!id && !onClose) throw new Error('Either id or onClose is required')

  // Prevent body scroll on mount
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    dispatch(modalOpened(modalId.current))

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [dispatch])

  // Handle escape key press
  const handleEscapeKeyPress = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      handleBackdropClick()
      e.stopPropagation()
    }
  }

  const handleBackdropClick = () => {
    // TODO: Simplify when all modals have been migrated
    if (onClose) {
      onClose()
    } else if (id) {
      dispatch(closeModal({ id }))
    } else {
      // This should never happen
    }
    moveFocusOnPreviousModal()
  }

  return (
    <motion.div className={className} onKeyDown={handleEscapeKeyPress} tabIndex={0} id={modalId.current} ref={modalRef}>
      <ModalBackdrop {...fadeInOutFast} onClick={handleBackdropClick} focusMode={focusMode} />
      {children}
    </motion.div>
  )
}

export default styled(ModalContainer)<{ hasPadding?: boolean }>`
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  padding: ${({ hasPadding }) => hasPadding && 'var(--spacing-4)'};
  z-index: 2;

  &:focus {
    outline: none;
  }
`

export const ModalBackdrop = styled(motion.div)<{ focusMode?: boolean; light?: boolean; blur?: boolean }>`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background-color: ${({ theme, focusMode, light }) =>
    theme.name === 'light'
      ? focusMode
        ? 'rgba(255, 255, 255, 0.9)'
        : 'rgba(255, 255, 255, 0.6)'
      : focusMode
        ? 'rgba(0, 0, 0, 0.9)'
        : light
          ? 'rgba(0, 0, 0, 0.25)'
          : 'rgba(0, 0, 0, 0.6)'};
  ${({ blur }) =>
    blur &&
    css`
      backdrop-filter: blur(4px);
    `}
`

export const useMoveFocusOnPreviousModal = () => {
  const visibleModals = useAppSelector((state) => state.global.visibleModals)
  const dispatch = useAppDispatch()

  const previouslyOpenedModal = visibleModals.at(-2)

  const moveFocusOnPreviousModal = () => {
    dispatch(modalClosed())

    if (previouslyOpenedModal) document.getElementById(previouslyOpenedModal)?.focus()
  }

  return moveFocusOnPreviousModal
}
