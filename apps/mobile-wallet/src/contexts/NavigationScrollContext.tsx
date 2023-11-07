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

import { createContext, MutableRefObject, ReactNode, RefObject, useContext, useRef } from 'react'
import { FlatList, ScrollView } from 'react-native'
import { SharedValue, useSharedValue } from 'react-native-reanimated'

type ScrollableView = ScrollView | FlatList

export type ScrollDirection = 'up' | 'down' | null
export type ScrollableViewRef = RefObject<ScrollView> | RefObject<FlatList>

interface NavigationScrollContextValue {
  scrollY?: SharedValue<number>
  scrollDirection?: SharedValue<ScrollDirection>
  activeScreenRef?: MutableRefObject<ScrollableView | null>
}

const NavigationScrollContext = createContext<NavigationScrollContextValue>({})

export const NavigationScrollContextProvider = ({ children }: { children: ReactNode }) => {
  const scrollY = useSharedValue(0)
  const scrollDirection = useSharedValue(null) as NavigationScrollContextValue['scrollDirection']
  const activeScreenRef = useRef<ScrollableView>(null)

  return (
    <NavigationScrollContext.Provider value={{ scrollY, scrollDirection, activeScreenRef }}>
      {children}
    </NavigationScrollContext.Provider>
  )
}

export const useNavigationScrollContext = () => {
  const context = useContext(NavigationScrollContext)

  if (!context) {
    console.error('useNavigationScrollContext must be used within NavigationScrollContextProvider')
  }

  return context
}

export default NavigationScrollContext
