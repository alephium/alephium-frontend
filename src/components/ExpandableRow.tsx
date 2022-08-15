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
  // TODO: Find a better way to measure the height of the collapsable section
  expandedHeight: number
  children: ReactNode
  title?: string
  style?: StyleProp<ViewStyle>
}

const ExpandableRow = ({ expandedHeight, children, title = 'Advanced options', style }: ExpandableRowProps) => {
  const theme = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const collapsableSectionStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? expandedHeight : 0)
  }))

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(isExpanded ? '180deg' : '0deg') }]
  }))

  return (
    <HighlightRow isTopRounded isBottomRounded style={style}>
      <Header onPress={toggleExpanded}>
        <Title>{title}</Title>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={theme.font.primary} />
        </Animated.View>
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
