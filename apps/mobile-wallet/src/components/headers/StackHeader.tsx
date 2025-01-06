import { SceneProgress } from '@react-navigation/stack/lib/typescript/src/types'

import Button from '~/components/buttons/Button'
import BaseHeader, { BaseHeaderProps } from '~/components/headers/BaseHeader'

export type StackHeaderCustomProps = BaseHeaderProps & {
  progress?: SceneProgress
}

const StackHeader = ({ onBackPress: goBack, options, ...props }: StackHeaderCustomProps) => {
  const HeaderLeft = goBack ? <Button onPress={goBack} iconProps={{ name: 'arrow-left' }} squared compact /> : null

  return <BaseHeader options={{ headerLeft: () => HeaderLeft, ...options }} {...props} />
}

export default StackHeader
