import { MotionValue } from 'framer-motion'
import { createContext, useContext } from 'react'

export type ScrollDirection = 'up' | 'down' | undefined

export interface ScrollContextType {
  scrollY?: MotionValue<number>
}

const ScrollContext = createContext<ScrollContextType>({
  scrollY: undefined
})

export const ScrollContextProvider = ScrollContext.Provider

export const useScrollContext = () => useContext(ScrollContext)
