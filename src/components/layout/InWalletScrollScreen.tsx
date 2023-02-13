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

import { ReactNode, useEffect } from 'react'
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  ScrollViewProps,
  StyleProp,
  ViewStyle
} from 'react-native'
import styled from 'styled-components/native'

import { useInWalletScrollContext } from '../../contexts/InWalletScrollContext'
import Screen from './Screen'

interface InWalletScrollScreenProps extends ScrollViewProps {
  children: ReactNode | ReactNode[]
  style?: StyleProp<ViewStyle>
}

const InWalletScrollScreen = ({ children, style, ...props }: InWalletScrollScreenProps) => {
  const { scrollY } = useInWalletScrollContext()

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!scrollY) return

    scrollY.value = e.nativeEvent.contentOffset.y
  }

  return (
    <Screen style={style}>
      <ScrollView onScroll={handleScroll} {...props} scrollEventThrottle={20}>
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
