import { useMotionValue } from 'framer-motion'
import { ReactNode, UIEvent, useRef } from 'react'
import { CustomScroll } from 'react-custom-scroll'

import { ScrollContextProvider, ScrollContextType } from '@/contexts/scroll'

interface ScrollbarCustomProps {
  children?: ReactNode
  className?: string
  onScroll?: (scrollTop: number) => void
}

const ScrollbarCustom = ({ children, className, onScroll }: ScrollbarCustomProps) => {
  const scrollY = useMotionValue(0)
  const contextValueRef = useRef<ScrollContextType>({ scrollY })

  const handleScrollUpdate = (e: UIEvent<Element>) => {
    const scrollTop = (e.target as HTMLElement).scrollTop

    scrollY.set(scrollTop)

    if (onScroll) {
      onScroll(scrollTop)
    }
  }

  return (
    <CustomScroll onScroll={handleScrollUpdate} flex="1" className={className} allowOuterScroll>
      <ScrollContextProvider value={contextValueRef.current}>{children}</ScrollContextProvider>
    </CustomScroll>
  )
}

export default ScrollbarCustom
