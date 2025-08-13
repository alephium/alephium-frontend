import { Children, ReactNode, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const stackingOffsetPx = 4

export const StackedToastsContainer = ({ children }: { children: ReactNode }) => {
  const listRef = useRef<HTMLDivElement>(null)
  const [totalHeight, setTotalHeight] = useState(0)

  useEffect(() => {
    if (!listRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const firstChildHeight = entry.target.firstElementChild?.getBoundingClientRect().height ?? 0

        setTotalHeight(firstChildHeight + (Children.count(children) - 1) * stackingOffsetPx)
      }
    })

    resizeObserver.observe(listRef.current)

    return () => resizeObserver.disconnect()
  }, [children])

  return (
    <StackedToastsContainerStyled>
      <StackedToastsList ref={listRef} style={{ height: totalHeight }}>
        {children}
      </StackedToastsList>
    </StackedToastsContainerStyled>
  )
}

const StackedToastsContainerStyled = styled.div`
  position: relative;
  width: 300px;
  display: flex;
  justify-content: center;
`

const StackedToastsList = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column-reverse;
  pointer-events: auto;
  align-items: center;

  &:hover {
    height: auto !important;

    & > div {
      position: relative;
      transform: none;
      width: 100%;

      & + div {
        margin-bottom: var(--spacing-1);
      }
    }
  }
`

export const StackedToast = styled.div<{ index: number }>`
  position: absolute;
  top: 0;
  width: ${({ index }) => 100 - index * 2}%;
  transform: translateY(${({ index }) => index * stackingOffsetPx}px);
  transition: all 0.2s ease;
`
