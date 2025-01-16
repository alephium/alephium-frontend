import { NativeStackScreenProps } from '@react-navigation/native-stack'
import Constants from 'expo-constants'
import WebView from 'react-native-webview'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface DAppWebViewScreenProps extends NativeStackScreenProps<RootStackParamList, 'DAppWebViewScreen'>, ScreenProps {}

const DAppWebViewScreen = ({ navigation, route, ...props }: DAppWebViewScreenProps) => {
  const { dAppUrl } = route.params

  if (!dAppUrl) return null

  return (
    <Screen safeAreaPadding headerOptions={{ type: 'stack', headerRight: () => <AppText>{dAppUrl}</AppText> }}>
      <WebViewStyled source={{ uri: dAppUrl }} allowsBackForwardNavigationGestures />
    </Screen>
  )
}

export default DAppWebViewScreen

const WebViewStyled = styled(WebView)`
  flex: 1;
  margin-top: ${Constants.statusBarHeight}px;
`
