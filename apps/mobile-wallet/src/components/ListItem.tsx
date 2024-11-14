/*
Copyright 2018 - 2024 The Alephium Authors
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

import { colord } from 'colord'
import { LinearGradient } from 'expo-linear-gradient'
import { ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import styled, { css, useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface ListItemProps extends PressableProps {
  title: string
  subtitle?: string | ReactNode
  icon: ReactNode
  isLast?: boolean
  isSelected?: boolean
  style?: StyleProp<ViewStyle>
  innerStyle?: StyleProp<ViewStyle>
  hideSeparator?: boolean
  rightSideContent?: ReactNode
  height?: number
  children?: ReactNode
  expandedSubtitle?: boolean
}

const AnimatedSelectedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const ListItem = ({
  title,
  subtitle,
  icon,
  style,
  innerStyle,
  isLast,
  isSelected,
  hideSeparator,
  rightSideContent,
  height = 60,
  children,
  expandedSubtitle,
  ...props
}: ListItemProps) => {
  const theme = useTheme()

  return (
    <Pressable {...props}>
      <ListItemStyled style={style}>
        {isSelected && (
          <SelectedLinearGradient
            pointerEvents="none"
            style={{ width: 100, height: '100%' }}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            locations={[0, 1]}
            colors={[colord(theme.global.accent).alpha(0.4).toHex(), colord(theme.global.accent).alpha(0).toHex()]}
            entering={FadeIn}
            exiting={FadeOut}
          />
        )}
        <Row style={[{ minHeight: height }, innerStyle]}>
          <Icon>{icon}</Icon>
          <RowContent showSeparator={!isLast && !hideSeparator}>
            <LeftSideContent>
              <Title semiBold size={16} numberOfLines={1}>
                {title}
              </Title>
              {typeof subtitle === 'string' ? (
                <Subtitle color="tertiary" numberOfLines={expandedSubtitle ? undefined : 1} ellipsizeMode="middle">
                  {subtitle}
                </Subtitle>
              ) : (
                subtitle
              )}
            </LeftSideContent>
            {rightSideContent}
          </RowContent>
        </Row>
        {children}
      </ListItemStyled>
    </Pressable>
  )
}

export default ListItem

const ListItemStyled = styled(Animated.View)``

const Row = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  gap: 18px;
`

const RowContent = styled.View<{ showSeparator: boolean }>`
  flex-direction: row;
  gap: 10px;
  padding: 16px 0;
  height: 100%;
  align-items: center;
  flex: 1;

  ${({ showSeparator }) =>
    showSeparator &&
    css`
      border-bottom-width: 1px;
      border-bottom-color: ${({ theme }) => theme.border.secondary};
    `}
`

const Title = styled(AppText)`
  max-width: 80%;
`

const Subtitle = styled(AppText)`
  max-width: 80%;
`

const Icon = styled.View``

const LeftSideContent = styled.View`
  flex: 1;
  justify-content: center;
`

const SelectedLinearGradient = styled(AnimatedSelectedLinearGradient)`
  position: absolute;
  left: -${DEFAULT_MARGIN}px;
`
