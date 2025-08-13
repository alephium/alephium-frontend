import { colord } from 'colord'
import styled, { useTheme } from 'styled-components'

interface CircularProgressProps {
  value: number
  radius?: number
  color?: string
  railColor?: string
  className?: string
}

const CircularProgress = ({ value, radius = 18, color, railColor, className }: CircularProgressProps) => {
  const theme = useTheme()
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - value * circumference
  const showCheckmark = value === 1

  return (
    <CircularProgressStyled value={value} className={className} style={{ borderRadius: radius * 2 }}>
      <svg width="100%" height="100%">
        {!showCheckmark && (
          <>
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={railColor || theme.bg.primary}
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke={color || theme.global.accent}
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                transformOrigin: 'center',
                transform: 'rotate(-90deg)'
              }}
            />
          </>
        )}
        {showCheckmark && (
          <CheckMark
            d="M15 25 L22 32 L35 18"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="48"
            strokeDashoffset="48" // Initially hidden
          />
        )}
      </svg>
    </CircularProgressStyled>
  )
}

export default CircularProgress

const CircularProgressStyled = styled.div<{ value: number }>`
  color: ${({ theme, value }) => (value < 1 ? theme.global.accent : theme.global.valid)};
  background-color: ${({ theme, value }) =>
    value < 1 ? 'transparent' : colord(theme.global.valid).alpha(0.15).toHex()};

  svg {
    transition: stroke-dashoffset 0.5s ease;
  }

  circle {
    transition: stroke-dashoffset 0.5s ease;
  }

  @keyframes draw-check {
    from {
      stroke-dashoffset: 48;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
`

const CheckMark = styled.path`
  animation: draw-check 0.8s ease-in-out forwards;
`
