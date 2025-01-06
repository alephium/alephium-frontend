import { AddressHash } from '@alephium/shared'
import { ParamListBase, useNavigation } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { SceneProgress } from '@react-navigation/stack/lib/typescript/src/types'
import { useTranslation } from 'react-i18next'

import StackHeader from '~/components/headers/StackHeader'
import { HeaderContextProvider, useHeaderContext } from '~/contexts/HeaderContext'
import { SendContextProvider } from '~/contexts/SendContext'
import AssetsScreen from '~/features/send/screens/AssetsScreen'
import DestinationScreen from '~/features/send/screens/DestinationScreen'
import OriginScreen from '~/features/send/screens/OriginScreen'
import VerifyScreen from '~/features/send/screens/VerifyScreen'

export interface SendNavigationParamList extends ParamListBase {
  DestinationScreen: { fromAddressHash?: AddressHash }
  OriginScreen?: { toAddressHash?: AddressHash }
  AssetsScreen?: { toAddressHash?: AddressHash }
  VerifyScreen: undefined
}

export type PossibleNextScreenAfterDestination = 'OriginScreen' | 'AssetsScreen'

const SendStack = createStackNavigator<SendNavigationParamList>()

const SendNavigation = () => (
  <SendContextProvider>
    <HeaderContextProvider>
      <SendStack.Navigator
        screenOptions={{
          header: ({ progress }) => <SendNavigationHeader progress={progress} />,
          headerMode: 'float'
        }}
        initialRouteName="DestinationScreen"
      >
        <SendStack.Screen name="DestinationScreen" component={DestinationScreen} />
        <SendStack.Screen name="OriginScreen" component={OriginScreen} />
        <SendStack.Screen name="AssetsScreen" component={AssetsScreen} />
        <SendStack.Screen name="VerifyScreen" component={VerifyScreen} />
      </SendStack.Navigator>
    </HeaderContextProvider>
  </SendContextProvider>
)

const SendNavigationHeader = ({ progress }: { progress: SceneProgress }) => {
  const { headerOptions, screenScrollY } = useHeaderContext()
  const navigation = useNavigation()
  const { t } = useTranslation()

  return (
    <StackHeader
      options={{ headerTitle: t('Send'), ...headerOptions }}
      titleAlwaysVisible
      scrollY={screenScrollY}
      onBackPress={() => navigation.goBack()}
      progress={progress}
    />
  )
}

export default SendNavigation
