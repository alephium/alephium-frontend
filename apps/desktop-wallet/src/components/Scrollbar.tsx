// Used as reference: https://github.com/xobotyi/react-scrollbars-custom/issues/46#issuecomment-897506147

import { useMotionValue } from 'framer-motion'
import { ReactNode, UIEvent, useRef } from 'react'
import { CustomScroll } from 'react-custom-scroll'

import { ScrollContextProvider, ScrollContextType } from '@/contexts/scroll'

interface ScrollbarCustomProps {
  children?: ReactNode
  className?: string
}

const ScrollbarCustom = ({ children, className }: ScrollbarCustomProps) => {
  const scrollY = useMotionValue(0)
  const contextValueRef = useRef<ScrollContextType>({ scrollY })

  const handleScrollUpdate = (e: UIEvent<Element>) => {
    scrollY.set((e.target as HTMLElement).scrollTop)
  }

  // react-scrollbars-custom has a type issue where you can't just spread props
  // onto the component. That's why needed props are added as necessary.
  return (
    <CustomScroll onScroll={handleScrollUpdate} flex="1" className={className}>
      <ScrollContextProvider value={contextValueRef.current}>{children}</ScrollContextProvider>
    </CustomScroll>
  )
}

export default ScrollbarCustom
