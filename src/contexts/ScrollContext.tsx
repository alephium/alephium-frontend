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

import { createContext, useContext } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

interface ScrollContextProps {
  scrollY?: SharedValue<number>
  isScrolling?: SharedValue<boolean>
}

const ScrollContext = createContext<ScrollContextProps>({
  scrollY: undefined
})

export const ScrollContextProvider: FC = ({ children }) => {
  const scrollY = useSharedValue(0)

  return <ScrollContext.Provider value={{ scrollY }}>{children}</ScrollContext.Provider>
}

export const useScrollContext = () => useContext(ScrollContext)

export const useScrollEventHandler = () => {
  const { scrollY } = useScrollContext()

  const scrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!scrollY) return
    scrollY.value = e.nativeEvent.contentOffset.y
  }

  return scrollHandler
}

export default ScrollContext
