import { AddressHash } from '@alephium/shared'
import { Token } from '@alephium/web3'
import {
  NavigationContainer,
  NavigationIndependentTree,
  ParamListBase,
  useNavigationContainerRef
} from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import StackHeader from '~/components/headers/StackHeader'
import { HeaderContextProvider, useHeaderContext } from '~/contexts/HeaderContext'
import { SendContextProvider } from '~/contexts/SendContext'
import AddressTokensScreen from '~/features/send/screens/addressTokensScreen/AddressTokensScreen'
import DestinationScreen from '~/features/send/screens/DestinationScreen'
import OriginScreen from '~/features/send/screens/OriginScreen'
import VerifyScreen from '~/features/send/screens/VerifyScreen'
import useWalletSingleAddress from '~/hooks/addresses/useWalletSingleAddress'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { useOnChildNavigationGoBack } from '~/navigation/useOnChildNavigationGoBack'

export interface SendNavigationParamList extends ParamListBase {
  DestinationScreen: { originAddressHash?: AddressHash }
  OriginScreen?: { tokenId?: Token['id'] }
  AddressTokensScreen?: { tokenId?: Token['id']; isNft?: boolean }
  VerifyScreen: undefined
}

export type PossibleNextScreenAfterDestination = 'OriginScreen' | 'AddressTokensScreen'

const SendStack = createStackNavigator<SendNavigationParamList>()

const SendNavigation = ({
  navigation: parentNavigation,
  route: { params }
}: StackScreenProps<RootStackParamList, 'SendNavigation'>) => {
  const navigationRef = useNavigationContainerRef()
  const walletSingleAddress = useWalletSingleAddress()
  const originAddressHash = params?.originAddressHash || walletSingleAddress

  const handleGoBack = useOnChildNavigationGoBack({ childNavigationRef: navigationRef, parentNavigation })

  const initialRouteName =
    params?.destinationAddressHash && originAddressHash
      ? 'AddressTokensScreen'
      : params?.destinationAddressHash
        ? 'OriginScreen'
        : 'DestinationScreen'

  return (
    <SendContextProvider
      originAddressHash={originAddressHash}
      destinationAddressHash={params?.destinationAddressHash}
      tokenId={params?.tokenId}
      isNft={params?.isNft}
    >
      <HeaderContextProvider>
        <View style={{ flex: 1 }}>
          <SendNavigationHeader onBackPress={handleGoBack} />
          <NavigationIndependentTree>
            <NavigationContainer ref={navigationRef}>
              <SendStack.Navigator
                screenOptions={{
                  headerShown: false
                }}
                initialRouteName={initialRouteName}
              >
                <SendStack.Screen
                  name="DestinationScreen"
                  component={DestinationScreen}
                  initialParams={{ originAddressHash }}
                />
                <SendStack.Screen
                  name="OriginScreen"
                  component={OriginScreen}
                  initialParams={{ tokenId: params?.tokenId }}
                />
                <SendStack.Screen
                  name="AddressTokensScreen"
                  component={AddressTokensScreen}
                  initialParams={{ tokenId: params?.tokenId, isNft: params?.isNft }}
                />
                <SendStack.Screen name="VerifyScreen" component={VerifyScreen} />
              </SendStack.Navigator>
            </NavigationContainer>
          </NavigationIndependentTree>
        </View>
      </HeaderContextProvider>
    </SendContextProvider>
  )
}

interface SendNavigationHeaderProps {
  onBackPress: () => void
}

const SendNavigationHeader = ({ onBackPress }: SendNavigationHeaderProps) => {
  const { headerOptions, screenScrollY } = useHeaderContext()
  const { t } = useTranslation()

  return (
    <StackHeader
      options={{ headerTitle: t('Send'), ...headerOptions }}
      titleAlwaysVisible
      scrollY={screenScrollY}
      onBackPress={onBackPress}
    />
  )
}

export default SendNavigation
