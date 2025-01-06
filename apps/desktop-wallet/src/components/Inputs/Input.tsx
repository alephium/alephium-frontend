import classNames from 'classnames'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useState, WheelEvent } from 'react'
import styled, { useTheme } from 'styled-components'

import { fadeInBottom } from '@/animations'
import Button from '@/components/Button'
import {
  inputDefaultStyle,
  InputErrorMessage,
  InputIconContainer,
  InputLabel,
  InputProps,
  inputStyling
} from '@/components/Inputs'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'

const Input = ({
  label,
  error,
  isValid,
  disabled,
  onChange,
  value,
  noMargin,
  hint,
  contrast,
  Icon,
  onIconPress,
  children,
  inputFieldStyle,
  inputFieldRef,
  liftLabel = false,
  heightSize = 'normal',
  largeText,
  ...props
}: InputProps) => {
  const theme = useTheme()

  const [canBeAnimated, setCanBeAnimated] = useState(false)

  const className = classNames(props.className, {
    error,
    isValid
  })

  const handleScroll = (e: WheelEvent<HTMLElement>) => {
    e.currentTarget.blur() // prevent changing number value by scrolling
  }

  return (
    <InputContainer
      variants={sectionChildrenVariants}
      animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
      onAnimationComplete={() => setCanBeAnimated(true)}
      custom={disabled}
      noMargin={noMargin}
      className={className}
      heightSize={heightSize}
    >
      <InputRow>
        {label && (
          <InputLabel isElevated={!!value || liftLabel} htmlFor={props.id}>
            {label}
          </InputLabel>
        )}
        <InputBase
          {...props}
          style={inputFieldStyle}
          label={label}
          value={value}
          onChange={onChange}
          disabled={disabled}
          isValid={isValid}
          onWheel={handleScroll}
          Icon={Icon}
          ref={inputFieldRef}
          heightSize={heightSize}
          contrast={contrast}
          largeText={largeText}
        />
        {!!Icon && !onIconPress && !isValid && (
          <InputIconContainer>
            <Icon size={16} />
          </InputIconContainer>
        )}
        {!!Icon && !!onIconPress && (
          <InputButtonContainer>
            <Button onClick={onIconPress} Icon={Icon} transparent squared borderless />
          </InputButtonContainer>
        )}
        {!disabled && isValid && (
          <InputIconContainer {...fadeInBottom}>
            <Check strokeWidth={3} color={theme.global.valid} />
          </InputIconContainer>
        )}
      </InputRow>
      {!disabled && error && <InputErrorMessage animate={{ y: 10, opacity: 1 }}>{error}</InputErrorMessage>}
      {hint && <Hint>{hint}</Hint>}
      {children}
    </InputContainer>
  )
}

export default Input

export const InputContainer = styled(motion.div)<Pick<InputProps, 'noMargin' | 'heightSize'>>`
  position: relative;
  min-height: ${({ heightSize }) =>
    heightSize === 'small' ? '50px' : heightSize === 'big' ? '60px' : 'var(--inputHeight)'};
  width: 100%;
  margin: ${({ noMargin }) => (noMargin ? 0 : '16px 0')};
`

export const InputBase = styled.input<InputProps>`
  ${({ isValid, value, label, Icon, heightSize, contrast, largeText }) =>
    inputDefaultStyle(isValid || !!Icon, !!value, !!label, heightSize, contrast, largeText)};
  color-scheme: ${({ theme }) => (colord(theme.bg.primary).isDark() ? 'dark' : 'light')};
`

const Hint = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.font.secondary};
  margin-left: 12px;
  margin-top: 6px;
`

const InputRow = styled.div`
  position: relative;
`

const InputButtonContainer = styled.div`
  position: absolute;
  right: ${inputStyling.paddingRight};
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
`
