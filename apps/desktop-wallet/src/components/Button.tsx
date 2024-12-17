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
import { HTMLMotionProps, motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { ReactNode, useEffect, useRef, useState } from 'react'
import styled, { css } from 'styled-components'

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
  rounded?: boolean
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
  iconSize = 16,
  className,
  isHighlighted,
  loading,
  animate,
  ...props
}: ButtonProps) => {
  const [canBeAnimated, setCanBeAnimated] = useState(props.squared ? true : false)
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
              <Icon size={iconSize} />
            </ButtonIcon>
          )}
          <ButtonContent>{children as ReactNode}</ButtonContent>
        </>
      )}
    </motion.button>
  )
}

export default styled(Button)`
  ${({ theme, role = 'primary', variant = 'default', transparent, iconColor, children }) => {
    const bgColor = transparent
      ? 'transparent'
      : {
          primary: {
            default: theme.bg.contrast,
            contrast: theme.bg.contrast,
            valid: theme.global.valid,
            alert: theme.global.alert,
            faded: colord(theme.global.accent).alpha(0.07).toRgbString()
          }[variant],
          secondary: {
            default: theme.bg.primary,
            contrast: theme.font.primary,
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
            contrast: colord(theme.bg.contrast).alpha(0.8).toRgbString(),
            valid: colord(theme.global.valid).darken(0.04).toRgbString(),
            alert: colord(theme.global.alert).darken(0.04).toRgbString(),
            faded: colord(theme.global.accent).darken(0.04).toRgbString()
          }[variant],
          secondary: {
            default: colord(theme.bg.primary).lighten(0.04).toRgbString(),
            contrast: colord(theme.bg.background2).lighten(0.04).toRgbString(),
            valid: colord(theme.global.valid).darken(0.04).toRgbString(),
            alert: colord(theme.global.alert).alpha(0.2).toRgbString(),
            faded: theme.bg.highlight
          }[variant]
        }[role]

    const activeBgColor = transparent
      ? colord(theme.bg.primary).isDark()
        ? colord(theme.global.accent).alpha(0.4).toRgbString()
        : colord(theme.global.accent).lighten(0.1).alpha(0.15).toRgbString()
      : {
          primary: {
            default: colord(theme.global.accent).lighten(0.03).toRgbString(),
            contrast: colord(theme.bg.contrast).alpha(0.8).toRgbString(),
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
            default: theme.font.contrastPrimary,
            contrast: theme.font.contrastPrimary,
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

    const hoverColor = transparent
      ? theme.font.primary
      : {
          primary: {
            default: 'white',
            contrast: theme.font.contrastPrimary,
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
      position: relative;

      &:hover {
        color: ${hoverColor};
        background-color: ${hoverBgColor};

        ${ButtonIcon} {
          svg {
            stroke: ${iconColor || hoverColor};
          }
        }
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
  justify-content: ${({ Icon }) => (Icon ? 'center' : 'flex-start')};
  height: ${({ squared, short, tall }) => (short ? '32px' : squared ? '34px' : tall ? '48px' : '42px')};
  width: ${({ squared, short, wide }) => (squared ? '34px' : short && !wide ? 'auto' : wide ? '100%' : '80%')};
  max-width: ${({ wide }) => (wide ? 'auto' : '250px')};
  border-radius: 100px;
  font-weight: ${({ role, variant }) =>
    role === 'secondary' || variant === 'faded' ? 'var(--fontWeight-medium)' : 'var(--fontWeight-semiBold)'};
  font-size: ${({ short }) => (short ? 13 : 14)}px;
  font-family: inherit;
  margin: ${({ squared }) => (squared ? '0' : '10px 0')};
  padding: ${({ squared, Icon }) => (squared ? 'var(--spacing-2)' : Icon ? '0 28px 0 14px' : '0 14px')};
  min-width: ${({ squared }) => (squared ? '34px' : '60px')};
  text-align: center;
  cursor: ${({ disablePointer }) => !disablePointer && 'pointer'};
  backdrop-filter: blur(10px)
    brightness(${({ theme, transparent }) => !transparent && (theme.name === 'dark' ? '1.5' : '2')}) saturate(1.2);

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

const ButtonContent = styled.div`
  flex: 1;
  width: 100%;
`
