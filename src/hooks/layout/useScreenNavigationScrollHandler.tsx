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

import { useFocusEffect } from '@react-navigation/native'
import { useCallback } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

import { ScrollableViewRef, useNavigationScrollContext } from '~/contexts/NavigationScrollContext'

const scrollDirectionDeltaThreshold = 10

const useScreenNavigationScrollHandler = (viewRefForScrollTopOnHeaderPress?: ScrollableViewRef) => {
  const { scrollY, scrollDirection, activeScreenRef } = useNavigationScrollContext()

  useFocusEffect(
    useCallback(() => {
      if (activeScreenRef && viewRefForScrollTopOnHeaderPress) {
        activeScreenRef.current = viewRefForScrollTopOnHeaderPress.current
      }
    }, [activeScreenRef, viewRefForScrollTopOnHeaderPress])
  )

  const scrollHandler = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!scrollY || !scrollDirection) return

    const newScrollY = e.nativeEvent.contentOffset.y

    const delta = scrollY.value - newScrollY
    const direction = delta > 0 ? 'up' : 'down'

    if (newScrollY === 0) {
      scrollDirection.value = null
    } else if (direction === 'up' && delta > scrollDirectionDeltaThreshold) {
      scrollDirection.value = 'up'
    } else if (direction === 'down' && delta < -scrollDirectionDeltaThreshold) {
      scrollDirection.value = 'down'
    }

    scrollY.value = newScrollY
  }

  return scrollHandler
}

export default useScreenNavigationScrollHandler
