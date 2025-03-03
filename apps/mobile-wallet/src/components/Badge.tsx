import { colord } from 'colord'
import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import styled, { css } from 'styled-components/native'

export interface BadgeProps {
  children: ReactNode
  color?: string
  rounded?: boolean
  border?: boolean
  light?: boolean
  solid?: boolean
  compact?: boolean
  style?: StyleProp<ViewStyle>
}

const Badge = ({ style, color, solid, compact, children }: BadgeProps) => (
  <View style={style}>
    {['string', 'number'].includes(typeof children) ? (
      <BadgeText color={color} solid={solid} style={{ fontSize: compact ? 12 : undefined }}>
        {children}
      </BadgeText>
    ) : (
      children
    )}
  </View>
)

export default styled(Badge)`
  flex-direction: row;
  gap: 4px;

  ${({ color, theme, rounded, border, light, solid, compact }) => {
    const usedColor = color || theme.font.primary

    return css`
      min-width: 25px;
      padding: ${compact ? '3px 5px' : '4px 8px'};
      align-items: center;
      justify-content: center;
      border-radius: ${rounded ? '30px' : '7px'};

      ${border &&
      css`
        border: 1px solid ${colord(usedColor).alpha(0.2).toHex()};
      `};

      ${!light &&
      css`
        background-color: ${colord(usedColor).alpha(0.08).toHex()};
      `}

      ${light &&
      border &&
      css`
        border-color: ${({ theme }) => theme.border.secondary};
      `}

      ${light &&
      !border &&
      css`
        background-color: ${({ theme }) => theme.bg.secondary};
      `}

      ${solid &&
      css`
        background-color: ${usedColor};
      `}
    `
  }}
`

const BadgeText = styled.Text<{ color?: string; solid?: boolean }>`
  ${({ color, solid, theme }) => css`
    color: ${solid ? 'white' : color || theme.font.primary};
  `}
`
