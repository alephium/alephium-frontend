import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Clipboard from 'expo-clipboard'
import Constants from 'expo-constants'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import WebView from 'react-native-webview'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface DAppWebViewScreenProps extends NativeStackScreenProps<RootStackParamList, 'DAppWebViewScreen'>, ScreenProps {}

const DAppWebViewScreen = ({ navigation, route, ...props }: DAppWebViewScreenProps) => {
  const { dAppUrl } = route.params

  useDetectWCUrlInClipboardAndPair()

  if (!dAppUrl) return null

  return (
    <Screen safeAreaPadding headerOptions={{ type: 'stack', headerRight: () => <AppText>{dAppUrl}</AppText> }}>
      <WebViewStyled source={{ uri: dAppUrl }} allowsBackForwardNavigationGestures />
    </Screen>
  )
}

export default DAppWebViewScreen

const useDetectWCUrlInClipboardAndPair = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { pairWithDapp } = useWalletConnectContext()

  useEffect(() => {
    const checkClipboard = async () => {
      const content = await Clipboard.getStringAsync()

      if (content.startsWith('wc:')) {
        Clipboard.setStringAsync('')

        dispatch(activateAppLoading(t('Connecting')))

        await pairWithDapp(content)

        dispatch(deactivateAppLoading())
      }
    }

    checkClipboard()

    const intervalId = setInterval(checkClipboard, 1000)

    return () => clearInterval(intervalId)
  }, [dispatch, pairWithDapp, t])
}

const WebViewStyled = styled(WebView)`
  flex: 1;
  margin-top: ${Constants.statusBarHeight}px;
`
