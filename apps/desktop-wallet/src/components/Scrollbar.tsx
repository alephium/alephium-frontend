import { useMotionValue } from 'framer-motion'
import { ReactNode, UIEvent, useState } from 'react'
import { CustomScroll } from 'react-custom-scroll'

import { ScrollContextProvider, ScrollContextType } from '@/contexts/scroll'

interface ScrollbarProps {
  children?: ReactNode
  className?: string
  onScroll?: (scrollTop: number) => void
}

const Scrollbar = ({ children, className, onScroll }: ScrollbarProps) => {
  const scrollY = useMotionValue(0)
  const [contextValue] = useState<ScrollContextType>({ scrollY })

  const handleScrollUpdate = (e: UIEvent<Element>) => {
    const scrollTop = (e.target as HTMLElement).scrollTop

    scrollY.set(scrollTop)

    if (onScroll) {
      onScroll(scrollTop)
    }
  }

  return (
    <CustomScroll onScroll={handleScrollUpdate} flex="1" className={className}>
      <ScrollContextProvider value={contextValue}>{children}</ScrollContextProvider>
    </CustomScroll>
  )
}

export default Scrollbar
