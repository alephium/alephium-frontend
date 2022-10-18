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
import styled from 'styled-components/native'

import { useInWalletLayoutContext } from '../../contexts/InWalletLayoutContext'
import Screen from './Screen'

interface ScreenProps {
  children: ReactNode | ReactNode[]
  onScroll: (scrollY: number) => void
  style?: StyleProp<ViewStyle>
}

const InWalletScrollScreen = ({ style, children, onScroll }: ScreenProps) => {
  const { scrollY, isScrolling } = useInWalletLayoutContext()

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollY) scrollY.value = e.nativeEvent.contentOffset.y
      if (isScrolling !== undefined) isScrolling.value = true

      onScroll(e.nativeEvent.contentOffset.y)
    },
    [scrollY, isScrolling, onScroll]
  )

  const handleScrollEndDrag = useCallback(() => {
    if (isScrolling !== undefined) isScrolling.value = false
  }, [isScrolling])

  return (
    <Screen style={style}>
      <ScrollView onScroll={handleScroll} onScrollEndDrag={handleScrollEndDrag}>
        <Content>{children}</Content>
      </ScrollView>
    </Screen>
  )
}

export default InWalletScrollScreen

// Add extra padding so that content is not hidden by the footer menu
const Content = styled.View`
  padding-bottom: 160px;
`
