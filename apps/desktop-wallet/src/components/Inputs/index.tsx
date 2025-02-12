import { colord } from 'colord'
import { motion, MotionProps, Variants } from 'framer-motion'
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
  paddingRight: '10px',
  paddingLeftRight: '10px'
}

export const inputDefaultStyle = (
  hasIcon?: boolean,
  topPadding?: boolean,
  hasLabel?: boolean,
  heightSize?: InputHeight,
  largeText?: boolean
) => css`
  height: ${heightSize === 'small' ? '34px' : heightSize === 'big' ? '42px' : 'var(--inputHeight)'};
  width: 100%;
  border-radius: ${heightSize === 'small'
    ? 'var(--radius-small)'
    : heightSize === 'big'
      ? 'var(--radius-big)'
      : 'var(--radius-medium)'};
  border: 1px solid ${({ theme }) => theme.border.primary};
  color: ${({ theme }) => theme.font.primary};
  padding: ${hasIcon ? `0 40px 0 ${inputStyling.paddingLeftRight}` : `0 ${inputStyling.paddingLeftRight}`};
  font-weight: var(--fontWeight-medium);
  font-size: ${largeText ? '14px' : '13px'};
  text-align: left;
  font-family: inherit;

  transition: all 0.1s;

  ${topPadding &&
  hasLabel &&
  css`
    padding-top: 13px;
  `}

  &:focus {
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.global.accent};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.global.accent};
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
  border-radius: var(--radius-huge);
  padding: 2px 8px;
`

export const InputLabel: FC<MotionProps & { isElevated: boolean }> = ({ isElevated, ...props }) => (
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

export const SelectLabel = styled.label`
  display: flex;
  align-items: center;
  font-weight: var(--fontWeight-medium);
  color: ${({ theme }) => theme.font.tertiary};
  pointer-events: none;
  transform-origin: left;
  z-index: 1;
  padding-right: 10px;
  border-right: 1px solid ${({ theme }) => theme.border.primary};
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
