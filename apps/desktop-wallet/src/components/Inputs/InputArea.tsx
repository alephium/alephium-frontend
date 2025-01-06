import { motion, MotionProps } from 'framer-motion'
import { KeyboardEventHandler, MouseEventHandler, MutableRefObject, ReactNode } from 'react'
import styled from 'styled-components'

interface InputAreaProps extends MotionProps {
  children: ReactNode | ReactNode[]
  onKeyDown?: KeyboardEventHandler
  onInput?: () => void
  onMouseDown?: MouseEventHandler
  className?: string
  innerRef?: MutableRefObject<HTMLDivElement>
  tabIndex?: number
}

const InputArea = ({ onKeyDown, onInput, children, className, onMouseDown, ...rest }: InputAreaProps) => (
  <motion.div onMouseDown={onMouseDown} onInput={onInput} onKeyDown={onKeyDown} className={className} {...rest}>
    {children}
  </motion.div>
)

export default styled(InputArea)`
  position: relative;
  display: flex;
  align-items: center;
  height: var(--inputHeight);
  width: 100%;
  cursor: pointer;
`
