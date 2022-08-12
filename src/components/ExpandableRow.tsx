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
import { ChevronDown } from 'lucide-react-native'
import { ReactNode, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import HighlightRow from './HighlightRow'

interface ExpandableRowProps {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

const ExpandableRow = ({ children, style }: ExpandableRowProps) => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const collapsableSectionStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? 100 : 0)
  }))

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg') }]
  }))

  return (
    <HighlightRow isTopRounded isBottomRounded style={style}>
      <Header onPress={toggleExpanded}>
        <Title>Advanced options</Title>
        <Chevron style={chevronStyle}>
          <ChevronDown size={20} color={theme.font.primary} />
        </Chevron>
      </Header>
      <CollapsableSection style={collapsableSectionStyle}>{children}</CollapsableSection>
    </HighlightRow>
  )
}

export default styled(ExpandableRow)`
  background-color: ${({ theme }) => theme.bg.tertiary};
  flex-direction: column;
  justify-content: center;
  padding-top: 0;
  padding-bottom: 0;
`

const Title = styled.Text`
  font-weight: bold;
`

const Header = styled.TouchableOpacity`
  justify-content: space-between;
  flex-direction: row;
  width: 100%;
  padding: 25px 0;
`

const CollapsableSection = styled(Animated.View)`
  width: 100%;
  height: 0;
  overflow: hidden;
`

const Chevron = styled(Animated.View)``
