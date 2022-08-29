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

import { ReactNode, useCallback } from 'react'
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleProp, ViewStyle } from 'react-native'

import { useInWalletLayoutContext } from '../../contexts/InWalletLayoutContext'
import Screen from './Screen'

interface ScreenProps {
  children: ReactNode | ReactNode[]
  style?: StyleProp<ViewStyle>
}

const InWalletScrollScreen = ({ style, children }: ScreenProps) => {
  const { scrollY, hasMomentum } = useInWalletLayoutContext()

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y
      if (hasMomentum !== undefined) hasMomentum.value = true
    },
    [scrollY, hasMomentum]
  )

  const handleScrollEndDrag = useCallback(() => {
    if (hasMomentum !== undefined) hasMomentum.value = false
  }, [hasMomentum])

  return (
    <Screen style={style}>
      <ScrollView onScroll={handleScroll} onScrollEndDrag={handleScrollEndDrag}>
        {children}
      </ScrollView>
    </Screen>
  )
}

export default InWalletScrollScreen
