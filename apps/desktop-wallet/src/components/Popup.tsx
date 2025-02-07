import { motion } from 'framer-motion'
import { MouseEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { fadeInOutBottomFast, fastTransition } from '@/animations'
import Scrollbar from '@/components/Scrollbar'
import ModalContainer from '@/modals/ModalContainer'
import { Coordinates } from '@/types/numbers'
import { useWindowSize } from '@/utils/hooks'

export interface PopupProps {
  onClose: () => void
  children?: ReactNode | ReactNode[]
  title?: string
  extraHeaderContent?: ReactNode
  hookCoordinates?: Coordinates
  minWidth?: number
}

const minMarginToEdge = 20
const headerHeight = 40

const Popup = ({ children, onClose, title, hookCoordinates, extraHeaderContent, minWidth = 200 }: PopupProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize() // Recompute position on window resize

  const contentRef = useRef<HTMLDivElement>(null)

  const [hookOffset, setHookOffset] = useState<Coordinates>()

  const handleHookClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (windowHeight && windowWidth) {
      const contentElement = contentRef.current
      const contentRect = contentElement?.getBoundingClientRect()

      const baseOffsetX =
        contentRect?.left && contentRect.left < minMarginToEdge
          ? -contentRect.left + 2 * minMarginToEdge
          : contentRect?.right && windowWidth - contentRect.right < minMarginToEdge
            ? windowWidth - contentRect.right - 2 * minMarginToEdge
            : 0

      const baseOffsetY =
        contentRect?.top && contentRect.top < minMarginToEdge
          ? -contentRect.top + 2 * minMarginToEdge
          : contentRect?.bottom && windowHeight - contentRect.bottom < minMarginToEdge
            ? windowHeight - contentRect.bottom - 2 * minMarginToEdge
            : 0

      setHookOffset({ x: baseOffsetX, y: baseOffsetY - 5 })
    }
  }, [windowHeight, windowWidth])

  const PopupContent = (
    <Content
      role="dialog"
      ref={contentRef}
      style={hookOffset && { x: hookOffset.x }}
      animate={hookOffset && { ...fadeInOutBottomFast.animate, ...hookOffset }}
      exit={fadeInOutBottomFast.exit}
      minWidth={minWidth}
      {...fastTransition}
    >
      {title && (
        <Header hasExtraContent={!!extraHeaderContent}>
          <Title>{title}</Title>
          {extraHeaderContent}
        </Header>
      )}
      <Scrollbar>{children}</Scrollbar>
    </Content>
  )

  return (
    <ModalContainer onClose={onClose}>
      {hookCoordinates ? (
        <Hook
          hookCoordinates={hookCoordinates}
          contentWidth={contentRef.current?.clientWidth || 0}
          onClick={handleHookClick}
        >
          {PopupContent}
        </Hook>
      ) : (
        PopupContent
      )}
    </ModalContainer>
  )
}

export default Popup

export const useElementAnchorCoordinates = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hookCoordinates, setHookCoordinates] = useState<Coordinates | undefined>(undefined)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = useCallback(() => {
    setHookCoordinates(() => {
      if (containerRef?.current) {
        const containerElement = containerRef.current
        const containerElementRect = containerElement.getBoundingClientRect()

        return {
          x: containerElementRect.x + containerElement.clientWidth / 2,
          y: containerElementRect.y + containerElement.clientHeight / 2
        }
      }
    })
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    containerRef.current?.focus()
  }, [])

  return {
    containerRef,
    hookCoordinates,
    isModalOpen,
    openModal,
    closeModal
  }
}

const Hook = styled.div<{ hookCoordinates: Coordinates; contentWidth: number }>`
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  top: ${({ hookCoordinates }) => hookCoordinates.y - headerHeight / 2}px;
  left: ${({ hookCoordinates, contentWidth }) => hookCoordinates.x - contentWidth / 2}px;
`

const Content = styled(motion.div)<Pick<PopupProps, 'minWidth'>>`
  opacity: 0; // for initial mount computation
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  min-width: ${({ minWidth }) => minWidth}px;
  max-height: 660px;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.secondary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.background1};
`

const Header = styled.div<{ hasExtraContent: boolean }>`
  height: ${({ hasExtraContent }) => (hasExtraContent ? 'auto' : `${headerHeight}px`)};
  padding: var(--spacing-2) var(--spacing-3) var(--spacing-2) var(--spacing-3);
  display: flex;
  align-items: center;
  z-index: 1;
  gap: var(--spacing-3);
  border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
`

const Title = styled.span`
  font-size: 14px;
`
