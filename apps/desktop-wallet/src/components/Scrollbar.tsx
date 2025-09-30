import { useMotionValue } from 'framer-motion'
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react'
import { ReactNode, UIEvent, useState } from 'react'
import { useTheme } from 'styled-components'

import { ScrollContextProvider, ScrollContextType } from '@/contexts/scroll'

interface ScrollbarProps {
  children?: ReactNode
  className?: string
  onScroll?: (scrollTop: number) => void
}

const Scrollbar = ({ children, className, onScroll }: ScrollbarProps) => {
  const scrollY = useMotionValue(0)
  const [contextValue] = useState<ScrollContextType>({ scrollY })
  const theme = useTheme()

  const handleScrollUpdate = (e: UIEvent<Element>) => {
    const scrollTop = (e.target as HTMLElement).scrollTop

    scrollY.set(scrollTop)

    if (onScroll) {
      onScroll(scrollTop)
    }
  }

  return (
    <OverlayScrollbarsComponent
      style={{ flex: 1 }}
      defer
      onScroll={handleScrollUpdate}
      className={className}
      options={{
        scrollbars: {
          theme: theme.name === 'dark' ? 'os-theme-light' : 'os-theme-dark',
          autoHide: 'leave'
        }
      }}
    >
      <ScrollContextProvider value={contextValue}>{children}</ScrollContextProvider>
    </OverlayScrollbarsComponent>
  )
}

export default Scrollbar
