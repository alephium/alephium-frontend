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
import { HTMLMotionProps, motion, Variants } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { InputHTMLAttributes, ReactNode, RefObject } from 'react'
import styled, { css, CSSProperties } from 'styled-components'

export type InputHeight = 'small' | 'normal' | 'big'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: ReactNode
  isValid?: boolean
  disabled?: boolean
  noMargin?: boolean
  contrast?: boolean
  hint?: string
  Icon?: LucideIcon
  onIconPress?: () => void
  inputFieldStyle?: CSSProperties
  inputFieldRef?: RefObject<HTMLInputElement>
  liftLabel?: boolean
  className?: string
  heightSize?: InputHeight
  simpleMode?: boolean
  largeText?: boolean
  showPointer?: boolean
}

export interface TextAreaProps extends InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  isValid?: boolean
  disabled?: boolean
}

export const inputPlaceHolderVariants: Variants = {
  up: { y: '-10px', scale: 0.8 },
  down: { y: 0, scale: 1 }
}

export const inputStyling = {
  paddingRight: '20px',
  paddingLeftRight: '20px'
}

export const inputDefaultStyle = (
  hasIcon?: boolean,
  hasValue?: boolean,
  hasLabel?: boolean,
  heightSize?: InputHeight,
  largeText?: boolean
) => css`
  height: ${heightSize === 'small' ? '38px' : heightSize === 'big' ? '50px' : 'var(--inputHeight)'};
  width: 100%;
  border-radius: 100px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  color: ${({ theme }) => theme.font.primary};
  padding: ${hasIcon ? `0 45px 0 ${inputStyling.paddingLeftRight}` : `0 ${inputStyling.paddingLeftRight}`};
  font-weight: var(--fontWeight-medium);
  font-size: ${largeText ? '15px' : '14px'};
  text-align: left;
  font-family: inherit;
  backdrop-filter: blur(10px) brightness(${({ theme }) => (theme.name === 'light' ? '2' : '1.5')}) saturate(1.2);

  transition: all 0.15s;

  ${hasValue &&
  hasLabel &&
  css`
    padding-top: 13px;
  `}

  &:focus {
    background-color: ${({ theme }) => theme.bg.hover};
    border: 1px solid ${({ theme }) => theme.global.accent};
  }

  &.error {
    background-color: ${({ theme }) => colord(theme.global.alert).alpha(0.1).toRgbString()};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.bg.secondary};
    cursor: not-allowed;
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
  }

  // Remove number arrows
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  &[type='number'] {
    -moz-appearance: textfield;
    appearance: textfield;
  }
`

export const InputErrorMessage = styled(motion.label)<InputProps>`
  position: absolute;
  bottom: 0px;
  right: 0;
  font-weight: var(--fontWeight-medium);
  opacity: 0;
  font-size: 0.8em;
  color: ${({ theme }) => theme.global.alert};
  border: 1px solid ${({ theme }) => theme.global.alert};
  border-radius: var(--radius-huge);
  padding: 2px 8px;
  background-color: ${({ theme }) => theme.bg.background1};
`

export const InputLabel: FC<HTMLMotionProps<'label'> & { isElevated: boolean }> = ({ isElevated, ...props }) => (
  <StyledInputLabel
    {...props}
    variants={inputPlaceHolderVariants}
    animate={!isElevated ? 'down' : 'up'}
    transition={{ type: 'spring', stiffness: 500, damping: 50 }}
  />
)

const StyledInputLabel = styled(motion.label)`
  position: absolute;
  left: calc(${inputStyling.paddingLeftRight} + 2px);
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.tertiary};
  pointer-events: none;
  transform-origin: left;
  z-index: 1;
`

export const InputIconContainer = styled(motion.div)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: var(--spacing-4);
  font-weight: var(--fontWeight-medium);
  display: flex;
  align-items: center;
`
