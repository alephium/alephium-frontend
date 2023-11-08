/*
Copyright 2018 - 2023 The Alephium Authors
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

import { useState } from 'react'
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

const useScreenScrollHandler = () => {
  const screenScrollY = useSharedValue(0)

  const [screenHeaderHeight, setScreenHeaderHeight] = useState(182) // Approx height to avoid jumping glitch (see #238)

  const screenScrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    screenScrollY.value = e.nativeEvent.contentOffset.y
  }

  const screenHeaderLayoutHandler = (e: LayoutChangeEvent) => {
    setScreenHeaderHeight(e.nativeEvent.layout.height)
  }

  return { screenScrollY, screenHeaderHeight, screenScrollHandler, screenHeaderLayoutHandler }
}

export default useScreenScrollHandler
