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

// Used as reference: https://github.com/xobotyi/react-scrollbars-custom/issues/46#issuecomment-897506147

import { useMotionValue } from 'framer-motion'
import { ReactNode, UIEvent, useRef } from 'react'
import { CustomScroll } from 'react-custom-scroll'

import { ScrollContextProvider, ScrollContextType } from '@/contexts/scroll'

interface ScrollbarCustomProps {
  children?: ReactNode
}

const ScrollbarCustom = ({ children }: ScrollbarCustomProps) => {
  const scrollY = useMotionValue(0)
  const contextValueRef = useRef<ScrollContextType>({ scrollY })

  const handleScrollUpdate = (e: UIEvent<Element>) => {
    scrollY.set((e.target as HTMLElement).scrollTop)
  }

  // react-scrollbars-custom has a type issue where you can't just spread props
  // onto the component. That's why needed props are added as necessary.
  return (
    <CustomScroll onScroll={handleScrollUpdate} flex="1">
      <ScrollContextProvider value={contextValueRef.current}>{children}</ScrollContextProvider>
    </CustomScroll>
  )
}

export default ScrollbarCustom
