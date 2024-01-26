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

import { ReactNode } from 'react'
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import Animated from 'react-native-reanimated'
import styled, { css } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS } from '~/style/globalStyle'

export interface ListItemProps extends PressableProps {
  title: string
  subtitle?: string | ReactNode
  icon: ReactNode
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  innerStyle?: StyleProp<ViewStyle>
  hideSeparator?: boolean
  rightSideContent?: ReactNode
  height?: number
  children?: ReactNode
}

const ListItem = ({
  title,
  subtitle,
  icon,
  style,
  innerStyle,
  isLast,
  hideSeparator,
  rightSideContent,
  height = 60,
  children,
  ...props
}: ListItemProps) => (
  <Pressable {...props}>
    <ListItemStyled style={style}>
      <Row style={[{ minHeight: height }, innerStyle]}>
        <Icon>{icon}</Icon>
        <RowContent showSeparator={!isLast && !hideSeparator}>
          <LeftSideContent>
            <Title semiBold size={16} numberOfLines={1}>
              {title}
            </Title>
            {typeof subtitle === 'string' ? (
              <Subtitle color="tertiary" numberOfLines={1} ellipsizeMode="middle">
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

export default ListItem

const ListItemStyled = styled(Animated.View)`
  border-radius: ${BORDER_RADIUS}px;
  border-color: ${({ theme }) => theme.border.primary};
  overflow: hidden;
`

const Row = styled(Animated.View)`
  flex-direction: row;
  align-items: center;
  padding-left: 15px;
  gap: 15px;
`

const RowContent = styled.View<{ showSeparator: boolean }>`
  flex-direction: row;
  gap: 10px;
  height: 100%;
  padding-right: 15px;
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
