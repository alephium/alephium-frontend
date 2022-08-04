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
import Animated, { SharedValue } from 'react-native-reanimated'
import styled from 'styled-components/native'

import useHeaderScrollStyle from '../../hooks/layout/useHeaderScrollStyle'

interface DefaultHeaderProps {
  HeaderRight: ReactNode
  HeaderLeft: ReactNode
  scrollY: SharedValue<number>
}

const DefaultHeader = ({ HeaderRight, HeaderLeft, scrollY }: DefaultHeaderProps) => {
  const headerStyle = useHeaderScrollStyle(scrollY)

  return (
    <HeaderContainer style={headerStyle}>
      {HeaderLeft}
      {HeaderRight}
    </HeaderContainer>
  )
}

const HeaderContainer = styled(Animated.View)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  padding-top: 40px;
`

export default DefaultHeader
