import { colord } from 'colord'
import styled, { css } from 'styled-components'

import { HasTooltip } from '@/components/Tooltip'
import Truncate from '@/components/Truncate'

interface BadgeProps {
  color?: string
  border?: boolean
  transparent?: boolean
  truncate?: boolean
  rounded?: boolean
  short?: boolean
  compact?: boolean
  className?: string
}

const Badge: FC<HasTooltip<BadgeProps>> = ({ className, children, truncate, tooltip }) => (
  <div className={className} data-tooltip-id="default" data-tooltip-content={tooltip}>
    {truncate ? <Truncate>{children}</Truncate> : children}
  </div>
)

export default styled(Badge)`
  ${({ color, theme, rounded, border, short, compact, truncate, transparent }) => {
    const usedColor = color || theme.font.primary

    return css`
      display: inline-flex;
      align-items: center;
      padding: 0 ${compact ? '5px' : short ? '8px' : '10px'};
      height: ${short ? 25 : compact ? 20 : 30}px;
      color: ${usedColor};
      border-radius: ${rounded ? '100px' : compact ? 'var(--radius-tiny)' : 'var(--radius-small)'};
      background-color: ${!transparent && colord(usedColor).alpha(0.08).toRgbString()};
      white-space: nowrap;
      font-size: ${compact ? '11px' : 'inherit'};

      ${border &&
      css`
        border: 1px solid ${theme.border.primary};
      `};
      ${truncate &&
      css`
        max-width: 100%;
      `}
    `
  }}
`
