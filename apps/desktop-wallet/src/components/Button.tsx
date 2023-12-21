/*
Copyright 2018 - 2023 The Alephium Authors
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
import { HTMLMotionProps, motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled, { css, useTheme } from 'styled-components'

import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import Spinner from '@/components/Spinner'

export interface ButtonProps extends HTMLMotionProps<'button'> {
  role?: 'primary' | 'secondary'
  variant?: 'default' | 'contrast' | 'valid' | 'alert' | 'faded'
  transparent?: boolean
  disabled?: boolean
  squared?: boolean
  submit?: boolean
  short?: boolean
  tall?: boolean
  wide?: boolean
  Icon?: LucideIcon
  iconColor?: string
  iconBackground?: boolean
  borderless?: boolean
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
  className,
  iconColor,
  isHighlighted,
  loading,
  ...props
}: ButtonProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(props.squared ? true : false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const theme = useTheme()

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
      variants={sectionChildrenVariants}
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
              <Icon size={15} color={iconColor || theme.font.tertiary} />
            </ButtonIcon>
          )}
          {children as ReactNode}
        </>
      )}
    </motion.button>
  )
}

export default styled(Button)`
  ${({
    theme,
    role = 'primary',
    variant = 'default',
    transparent,
    borderless,
    iconBackground,
    iconColor,
    children
  }) => {
    const bgColor = transparent
      ? 'transparent'
      : {
          primary: {
            default: theme.global.accent,
            contrast: theme.bg.background2,
            valid: theme.global.valid,
            alert: theme.global.alert,
            faded: colord(theme.global.accent).alpha(0.07).toRgbString()
          }[variant],
          secondary: {
            default: theme.bg.primary,
            contrast: theme.bg.background2,
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
            default: colord(theme.global.accent).darken(0.04).toRgbString(),
            contrast: colord(theme.bg.background2).lighten(0.04).toRgbString(),
            valid: colord(theme.global.valid).darken(0.04).toRgbString(),
            alert: colord(theme.global.alert).darken(0.04).toRgbString(),
            faded: colord(theme.global.accent).darken(0.04).toRgbString()
          }[variant],
          secondary: {
            default: theme.bg.hover,
            contrast: colord(theme.bg.background2).lighten(0.04).toRgbString(),
            valid: colord(theme.global.valid).darken(0.04).toRgbString(),
            alert: colord(theme.global.alert).alpha(0.2).toRgbString(),
            faded: colord(theme.bg.primary).lighten(0.04).toRgbString()
          }[variant]
        }[role]

    const activeBgColor = transparent
      ? colord(theme.bg.primary).isDark()
        ? colord(theme.global.accent).alpha(0.4).toRgbString()
        : colord(theme.global.accent).lighten(0.1).alpha(0.15).toRgbString()
      : {
          primary: {
            default: colord(theme.global.accent).lighten(0.03).toRgbString(),
            contrast: colord(theme.bg.background2).darken(0.08).toRgbString(),
            valid: colord(theme.global.valid).lighten(0.03).toRgbString(),
            alert: colord(theme.global.alert).lighten(0.03).toRgbString(),
            faded: colord(theme.global.accent).lighten(0.03).toRgbString()
          }[variant],
          secondary: {
            default: colord(theme.bg.primary).darken(0.08).toRgbString(),
            contrast: colord(theme.bg.background2).darken(0.08).toRgbString(),
            valid: colord(theme.global.valid).lighten(0.03).toRgbString(),
            alert: colord(theme.global.alert).lighten(0.3).toRgbString(),
            faded: colord(theme.bg.primary).darken(0.08).toRgbString()
          }[variant]
        }[role]

    const fontColor = transparent
      ? theme.font.secondary
      : {
          primary: {
            default: 'white',
            contrast: theme.font.secondary,
            valid: theme.font.contrastPrimary,
            alert: 'white',
            faded: theme.global.accent
          }[variant],
          secondary: {
            default: theme.font.secondary,
            contrast: theme.font.contrastSecondary,
            valid: theme.font.contrastPrimary,
            alert: theme.global.alert,
            faded: theme.font.primary
          }[variant]
        }[role]

    const borderColor = borderless
      ? 'transparent'
      : transparent
        ? {
            primary: {
              default: theme.global.accent,
              contrast: theme.bg.background2,
              valid: theme.global.valid,
              alert: theme.global.alert,
              faded: colord(theme.global.accent).alpha(0.25).toRgbString()
            }[variant],
            secondary: {
              default: theme.border.primary,
              contrast: theme.bg.background2,
              valid: theme.global.valid,
              alert: theme.global.alert,
              faded: theme.border.secondary
            }[variant]
          }[role]
        : {
            primary: {
              default: theme.border.primary,
              contrast: theme.border.primary,
              valid: theme.border.primary,
              alert: theme.border.primary,
              faded: theme.border.primary
            }[variant],
            secondary: {
              default: theme.border.primary,
              contrast: theme.border.primary,
              valid: theme.global.valid,
              alert: theme.global.alert,
              faded: theme.border.primary
            }[variant]
          }[role]

    const hoverColor = transparent
      ? theme.font.primary
      : {
          primary: {
            default: 'white',
            contrast: theme.font.secondary,
            valid: theme.font.primary,
            alert: 'white',
            faded: 'white'
          }[variant],
          secondary: {
            default: theme.font.primary,
            contrast: theme.font.secondary,
            valid: theme.font.contrastPrimary,
            alert: theme.global.alert,
            faded: theme.font.primary
          }[variant]
        }[role]

    return css`
      background-color: ${bgColor};
      color: ${fontColor};
      border: 1px solid ${borderColor};
      position: relative;

      ${!transparent &&
      !borderless &&
      css`
        box-shadow: ${({ theme }) => theme.shadow.primary};
      `}

      &:hover {
        color: ${hoverColor};
        background-color: ${hoverBgColor};

        ${ButtonIcon} {
          svg {
            stroke: ${hoverColor};
          }
        }
      }

      &:active {
        background-color: ${activeBgColor};
      }

      ${ButtonIcon} {
        ${children &&
        css`
          margin-right: var(--spacing-2);
        `}

        ${({ theme }) =>
          iconBackground &&
          css`
            background-color: ${colord(iconColor || theme.font.tertiary)
              .alpha(0.08)
              .toHex()};
            padding: 6px;
            border-radius: var(--radius-full);
          `}

        svg {
          color: ${fontColor};
        }
      }
    `
  }}

  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ squared, short, tall }) => (short ? '32px' : squared ? '40px' : tall ? '55px' : '52px')};
  width: ${({ squared, short, wide }) => (squared ? '40px' : short && !wide ? 'auto' : wide ? '100%' : '80%')};
  max-width: ${({ wide }) => (wide ? 'auto' : '250px')};
  border-radius: ${({ short }) => (short ? 'var(--radius-medium)' : 'var(--radius-big)')};
  font-weight: ${({ role, variant }) =>
    role === 'secondary' || variant === 'faded' ? 'var(--fontWeight-medium)' : 'var(--fontWeight-semiBold)'};
  font-size: 13px;
  font-family: inherit;
  margin: ${({ squared }) => (squared ? '0' : '12px 0')};
  padding: ${({ squared }) => (squared ? 'var(--spacing-2)' : '0 13px')};
  min-width: ${({ squared }) => (squared ? '40px' : '60px')};
  text-align: center;
  cursor: ${({ disablePointer }) => !disablePointer && 'pointer'};

  &:disabled {
    opacity: 0.5;
  }

  pointer-events: ${({ disabled: deactivated }) => (deactivated ? 'none' : 'auto')};

  &:focus-visible {
    box-shadow: 0 0 0 1px ${({ theme }) => theme.global.accent};
    border: 1px solid ${({ theme }) => theme.global.accent};
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
      border: 1px solid ${({ theme }) => theme.bg.accent};
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
