import { MotiView } from 'moti'
import styled, { useTheme } from 'styled-components/native'

import Button, { ButtonProps } from '~/components/buttons/Button'

interface HighlightButtonProps extends ButtonProps {
  title: string
  wide?: boolean
}

const HighlightButton = ({ title, wide, ...props }: HighlightButtonProps) => {
  const theme = useTheme()

  return (
    <ButtonWrapper
      from={{ scale: 1 }}
      animate={{ scale: 1.02 }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 500
      }}
    >
      <Button
        title={title}
        style={{ backgroundColor: theme.global.accent }}
        color="white"
        variant="accent"
        type="primary"
        {...props}
      />
    </ButtonWrapper>
  )
}

export default HighlightButton

const ButtonWrapper = styled(MotiView)`
  width: 100%;
  align-items: center;
`
