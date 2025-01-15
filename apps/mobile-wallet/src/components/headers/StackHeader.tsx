import Button from '~/components/buttons/Button'
import BaseHeader, { BaseHeaderProps } from '~/components/headers/BaseHeader'

const StackHeader = ({ onBackPress: goBack, options, ...props }: BaseHeaderProps) => {
  const HeaderLeft = goBack ? <Button onPress={goBack} iconProps={{ name: 'arrow-left' }} squared compact /> : null

  return <BaseHeader options={{ headerLeft: () => HeaderLeft, ...options }} {...props} />
}

export default StackHeader
