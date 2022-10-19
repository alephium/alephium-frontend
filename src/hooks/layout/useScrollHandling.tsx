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

import { useCallback } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { ScrollViewProps } from 'react-native'

import { useInWalletLayoutContext } from '../../contexts/InWalletLayoutContext'

interface useScrollHandlingProps {
  onScroll: ScrollViewProps['onScroll']
  onScrollEndDrag: ScrollViewProps['onScrollEndDrag']
  onScrollYChange: (scrollY: number) => void
}

const useScrollHandling = ({ onScroll, onScrollEndDrag, onScrollYChange }: useScrollHandlingProps) => {
  const { scrollY, isScrolling } = useInWalletLayoutContext()

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const newScrollY = e.nativeEvent.contentOffset.y

      if (scrollY) scrollY.value = newScrollY
      if (isScrolling !== undefined) isScrolling.value = true
      if (onScroll) onScroll(e)
      if (onScrollYChange) onScrollYChange(newScrollY)
    },
    [isScrolling, onScroll, onScrollYChange, scrollY]
  )

  const handleScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isScrolling !== undefined) isScrolling.value = false
      if (onScrollEndDrag) onScrollEndDrag(e)
    },
    [isScrolling, onScrollEndDrag]
  )

  return [handleScroll, handleScrollEndDrag]
}

export default useScrollHandling
