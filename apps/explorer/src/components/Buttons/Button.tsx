import { colord } from 'colord'
import { HTMLMotionProps, motion } from 'framer-motion'
import styled, { useTheme } from 'styled-components'

interface ButtonProps extends HTMLMotionProps<'button'> {
  accent?: boolean
  big?: boolean
}

const Button = ({ accent, big, ...props }: ButtonProps) => {
  const theme = useTheme()

  const bgColor = accent ? theme.global.accent : theme.bg.primary

  return (
    <motion.button
      {...props}
      style={{
        height: big ? '50px' : 'intial',
        minWidth: big ? '250px' : 'initial'
      }}
      initial={{ backgroundColor: bgColor }}
      animate={{
        backgroundColor: bgColor,
        color: accent ? '#ffffff' : theme.font.primary
      }}
      whileHover={{
        backgroundColor:
          theme.name === 'dark'
            ? colord(bgColor).lighten(0.05).toRgbString()
            : colord(bgColor).darken(0.03).toRgbString()
      }}
      transition={{
        duration: 0.1
      }}
    />
  )
}

export default styled(Button)`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.border.primary};
  padding: 10px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`
