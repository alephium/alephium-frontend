import { motion } from 'framer-motion'
import { MouseEvent, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { fadeInOutBottomFast, fastTransition } from '@/animations'
import Scrollbar from '@/components/Scrollbar'
import ModalContainer from '@/modals/ModalContainer'
import { appHeaderHeightPx, maxPopupHeightPx } from '@/style/globalStyles'
import { Coordinates } from '@/types/numbers'
import { useWindowSize } from '@/utils/hooks'

export interface PopupProps {
  onClose: () => void
  children?: ReactNode | ReactNode[]
  title?: string
  extraHeaderContent?: ReactNode
  hookCoordinates?: Coordinates
  minWidth?: number
  maxHeight?: number
}

const minMarginToEdge = 20
const headerHeight = 40

const Popup = ({ children, onClose, title, hookCoordinates, extraHeaderContent, minWidth = 200 }: PopupProps) => {
  const { height: windowHeight, width: windowWidth } = useWindowSize() // Recompute position on window resize

  const contentRef = useRef<HTMLDivElement>(null)

  const [hookOffset, setHookOffset] = useState<Coordinates>()
  const [contentWidth, setContentWidth] = useState(0)

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
      setContentWidth(contentRef.current?.clientWidth || 0)
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
      maxHeight={windowHeight !== undefined && windowHeight < maxPopupHeightPx ? windowHeight : undefined}
      {...fastTransition}
    >
      {title && (
        <Header hasExtraContent={!!extraHeaderContent}>
          <Title>{title}</Title>
          <ExtraHeaderContentContainer>{extraHeaderContent}</ExtraHeaderContentContainer>
        </Header>
      )}
      <ScrollableContent>
        <Scrollbar>{children}</Scrollbar>
      </ScrollableContent>
    </Content>
  )

  return (
    <ModalContainer onClose={onClose}>
      {hookCoordinates ? (
        <Hook hookCoordinates={hookCoordinates} contentWidth={contentWidth} onClick={handleHookClick}>
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
          y: Math.max(containerElementRect.y + containerElement.clientHeight / 2, appHeaderHeightPx)
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

const Content = styled(motion.div)<Pick<PopupProps, 'minWidth' | 'maxHeight'>>`
  opacity: 0; // for initial mount computation
  position: relative;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  padding-bottom: var(--spacing-1);

  min-width: ${({ minWidth }) => minWidth}px;
  max-height: ${({ maxHeight }) => (maxHeight ?? maxPopupHeightPx) - headerHeight}px;
  margin: auto;

  box-shadow: ${({ theme }) => theme.shadow.tertiary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme }) => theme.bg.background1};
`

const ScrollableContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`

const Header = styled.div<{ hasExtraContent: boolean }>`
  height: ${({ hasExtraContent }) => (hasExtraContent ? 'auto' : `${headerHeight}px`)};
  min-height: ${headerHeight}px;
  padding: 0 var(--spacing-1) 0 var(--spacing-3);
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  align-items: center;
  z-index: 1;
  gap: var(--spacing-3);
`

const Title = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.font.secondary};
  text-transform: uppercase;
  flex-shrink: 0;
`

const ExtraHeaderContentContainer = styled.div`
  flex: 1;
`
