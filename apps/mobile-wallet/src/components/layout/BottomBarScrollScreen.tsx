import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface BottomBarScrollScreenProps extends ScrollScreenProps {
  hasBottomBar?: boolean
}

const BottomBarScrollScreen = ({ hasBottomBar = false, children, ...props }: BottomBarScrollScreenProps) => {
  const bottomBarHeight = useBottomTabBarHeight()

  return (
    <ScrollScreen
      contentContainerStyle={[
        {
          paddingBottom: hasBottomBar ? bottomBarHeight + DEFAULT_MARGIN : 0
        },
        props.contentContainerStyle
      ]}
      {...props}
    >
      {children}
    </ScrollScreen>
  )
}

export default BottomBarScrollScreen
