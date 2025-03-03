import { colord } from 'colord'
import { HTMLMotionProps, motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

import Spinner from '@/components/Spinner'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  role?: 'primary' | 'secondary'
  variant?: 'default' | 'valid' | 'alert' | 'faded'
  transparent?: boolean
  disabled?: boolean
  circle?: boolean
  submit?: boolean
  short?: boolean
  tall?: boolean
  tiny?: boolean
  squared?: boolean
  wide?: boolean
  justifyContent?: 'center' | 'flex-start'
  Icon?: LucideIcon
  iconColor?: string
  iconSize?: number
  isHighlighted?: boolean
  disablePointer?: boolean
  loading?: boolean
  className?: string
}

const Button = ({
  children,
  disabled,
  submit,
  Icon,
  iconSize,
  className,
  isHighlighted,
  loading,
  animate,
  justifyContent,
  ...props
}: ButtonProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(props.circle ? true : false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!submit) return

    const listener = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        buttonRef.current?.click()
      }
    }

    document.addEventListener('keydown', listener)

    return () => {
      document.removeEventListener('keydown', listener)
    }
  }, [submit])

  return (
    <motion.button
      {...props}
      className={className}
      custom={disabled}
      disabled={disabled || loading}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      type={submit ? 'submit' : 'button'}
      ref={buttonRef}
    >
      {loading ? (
        <Spinner size="18px" />
      ) : (
        <>
          {Icon && (
            <ButtonIcon>
              <Icon size={iconSize ?? (!children ? 16 : 15)} />
            </ButtonIcon>
          )}
          {children as ReactNode}
        </>
      )}
    </motion.button>
  )
}

export default styled(Button)`
  ${({ theme, role = 'primary', variant = 'default', transparent, tall, iconColor, children }) => {
    const bgColor = transparent
      ? 'transparent'
      : {
          primary: {
            default: theme.bg.contrast,
            valid: theme.global.valid,
            alert: theme.global.alert,
            faded: colord(theme.global.accent).alpha(0.07).toRgbString()
          }[variant],
          secondary: {
            default: theme.bg.primary,
            valid: theme.global.valid,
            alert: colord(theme.global.alert).alpha(0.1).toRgbString(),
            faded: colord(theme.bg.primary).alpha(0.07).toRgbString()
          }[variant]
        }[role]

    const hoverBgColor = transparent
      ? colord(theme.bg.primary).isDark()
        ? colord(theme.bg.primary).lighten(0.02).toRgbString()
        : theme.bg.hover
      : {
          primary: {
            default: colord(theme.bg.contrast).alpha(0.8).toRgbString(),
            valid: colord(theme.global.valid).darken(0.04).toRgbString(),
            alert: colord(theme.global.alert).darken(0.04).toRgbString(),
            faded: colord(theme.global.accent).darken(0.04).toRgbString()
          }[variant],
          secondary: {
            default:
              theme.name === 'light'
                ? colord(theme.bg.primary).lighten(0.5).toRgbString()
                : colord(theme.bg.primary).darken(0.7).toRgbString(),
            valid: colord(theme.global.valid).darken(0.04).toRgbString(),
            alert: colord(theme.global.alert).alpha(0.2).toRgbString(),
            faded: theme.bg.highlight
          }[variant]
        }[role]

    const activeBgColor = transparent
      ? colord(theme.bg.primary).isDark()
        ? colord(theme.bg.primary).alpha(0.4).toRgbString()
        : colord(theme.bg.primary).lighten(0.1).alpha(0.15).toRgbString()
      : {
          primary: {
            default: colord(theme.bg.primary).lighten(0.03).toRgbString(),
            valid: colord(theme.global.valid).lighten(0.03).toRgbString(),
            alert: colord(theme.global.alert).lighten(0.03).toRgbString(),
            faded: colord(theme.bg.primary).lighten(0.03).toRgbString()
          }[variant],
          secondary: {
            default: colord(theme.bg.primary).darken(0.08).toRgbString(),
            valid: colord(theme.global.valid).lighten(0.03).toRgbString(),
            alert: colord(theme.global.alert).lighten(0.3).toRgbString(),
            faded: colord(theme.bg.primary).darken(0.08).toRgbString()
          }[variant]
        }[role]

    const fontColor = transparent
      ? theme.font.secondary
      : {
          primary: {
            default: theme.font.contrastPrimary,
            valid: theme.font.contrastPrimary,
            alert: 'white',
            faded: theme.global.accent
          }[variant],
          secondary: {
            default: theme.font.secondary,
            valid: theme.font.contrastPrimary,
            alert: theme.global.alert,
            faded: theme.font.primary
          }[variant]
        }[role]

    const hoverColor = transparent
      ? theme.font.primary
      : {
          primary: {
            default: theme.font.contrastPrimary,
            valid: theme.font.primary,
            alert: 'white',
            faded: 'white'
          }[variant],
          secondary: {
            default: theme.font.primary,
            valid: theme.font.contrastPrimary,
            alert: theme.global.alert,
            faded: theme.font.primary
          }[variant]
        }[role]

    return css`
      background-color: ${bgColor};
      color: ${fontColor};
      box-shadow: ${role === 'primary' ? (tall ? theme.shadow.primary : theme.shadow.secondary) : 'none'};
      position: relative;

      &:hover {
        color: ${hoverColor};
        background-color: ${hoverBgColor};
      }

      &:active {
        background-color: ${activeBgColor};
      }

      ${ButtonIcon} {
        svg {
          color: ${iconColor || fontColor};
        }
      }

      ${children &&
      css`
        gap: 10px;
      `}
    `
  }}

  display: flex;
  align-items: center;
  justify-content: ${({ Icon, justifyContent, children }) =>
    justifyContent ?? (!Icon || !children ? 'center' : 'flex-start')};
  height: ${({ circle, short, tall, tiny }) =>
    tiny ? '28px' : short ? '30px' : circle ? '34px' : tall ? '44px' : 'var(--inputHeight)'};
  width: ${({ circle, short, wide, tiny }) =>
    tiny ? '28px' : circle ? '34px' : short && !wide ? 'auto' : wide ? '100%' : '80%'};
  max-width: ${({ wide }) => (wide ? 'auto' : '250px')};
  border-radius: ${({ squared }) => (squared ? 'var(--radius-medium)' : '100px')};
  font-weight: ${({ tall }) => (tall ? 'var(--fontWeight-semiBold)' : 'var(--fontWeight-medium)')};
  font-size: ${({ tall }) => (tall ? 14 : 13)}px;
  font-family: inherit;
  margin: ${({ circle }) => (circle ? '0' : '10px 0')};
  padding: ${({ circle, short }) => (circle ? 'var(--spacing-2)' : short ? '0 12px' : '0 14px')};
  min-width: ${({ circle, tiny }) => (tiny ? '28px' : circle ? '34px' : '60px')};
  text-align: center;
  cursor: ${({ disablePointer }) => !disablePointer && 'pointer'};
  backdrop-filter: ${({ transparent, theme }) =>
    !transparent && `blur(20px) ${theme.name === 'dark' ? 'saturate(180%)' : 'saturate(180%) brightness(115%)'}`};

  &:disabled {
    opacity: 0.5;
  }

  pointer-events: ${({ disabled: deactivated }) => (deactivated ? 'none' : 'auto')};

  &:focus-visible {
    box-shadow: 0 0 0 2px ${({ theme }) => theme.global.accent};
  }

  // Highlight animation

  ${({ isHighlighted }) =>
    isHighlighted &&
    css`
      animation-name: breathing;
      animation-duration: 1.5s;
      animation-iteration-count: infinite;
      animation-direction: alternate;
      animation-timing-function: ease-in-out;
    `}

  @keyframes breathing {
    from {
      background-color: ${({ theme }) => theme.bg.accent};
    }
    to {
      background-color: initial;
    }
  }
`

const ButtonIcon = styled.div`
  display: flex;
`
