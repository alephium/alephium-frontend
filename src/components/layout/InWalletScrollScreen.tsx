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

import { ReactNode } from 'react'
import { ScrollView, ScrollViewProps, StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import useScrollHandling from '../../hooks/layout/useScrollHandling'
import Screen from './Screen'

interface ScreenProps extends ScrollViewProps {
  children: ReactNode | ReactNode[]
  onScrollYChange: (scrollY: number) => void
  style?: StyleProp<ViewStyle>
}

const InWalletScrollScreen = ({
  style,
  children,
  onScroll,
  onScrollEndDrag,
  onScrollYChange,
  ...props
}: ScreenProps) => {
  const [handleScroll, handleScrollEndDrag] = useScrollHandling({
    onScroll,
    onScrollEndDrag,
    onScrollYChange
  })

  return (
    <Screen style={style}>
      <ScrollView onScroll={handleScroll} onScrollEndDrag={handleScrollEndDrag} {...props} scrollEventThrottle={20}>
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
