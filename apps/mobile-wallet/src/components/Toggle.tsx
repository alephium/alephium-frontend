import { Switch, SwitchProps } from 'react-native'
import { useTheme } from 'styled-components/native'

interface ToggleProps extends SwitchProps {
  onValueChange?: (value: boolean) => void
}

const Toggle = ({ onValueChange, ...props }: ToggleProps) => {
  const theme = useTheme()

  return (
    <Switch
      {...props}
      onValueChange={onValueChange}
      trackColor={{
        false: props.disabled ? theme.bg.back1 : theme.font.secondary,
        true: props.disabled ? theme.bg.back1 : theme.global.accent
      }}
      thumbColor={theme.name === 'light' ? theme.font.contrast : theme.font.primary}
    />
  )
}

export default Toggle
