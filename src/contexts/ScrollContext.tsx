/*
Copyright 2018 - 2022 The Alephium Authors
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

import { createContext, ReactNode, useContext, useState } from 'react'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

interface ScrollContextValue {
  scrollY?: SharedValue<number>
  scrollDirection?: SharedValue<ScrollDirection>
  scrollToTop?: () => void
  setScrollToTop: (scrollToTop: () => void) => void
}

export type ScrollDirection = 'up' | 'down' | undefined

const ScrollContext = createContext<ScrollContextValue>({
  scrollY: undefined,
  scrollDirection: undefined,
  scrollToTop: undefined,
  setScrollToTop: () => () => null
})

export const ScrollContextProvider = ({ children }: { children: ReactNode }) => {
  const scrollY = useSharedValue(0)
  const scrollDirection = useSharedValue(undefined as ScrollDirection)
  const [scrollToTop, setScrollToTop] = useState<() => void>(() => () => null)

  return (
    <ScrollContext.Provider value={{ scrollY, scrollDirection, scrollToTop, setScrollToTop }}>
      {children}
    </ScrollContext.Provider>
  )
}

export const useScrollContext = () => {
  const context = useContext(ScrollContext)

  if (!context) {
    throw new Error('useScrollContext must be used within ScrollContextProvider')
  }

  return context
}

export default ScrollContext
