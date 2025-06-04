import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView, { WebViewNavigation } from 'react-native-webview'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import AddToFavoritesButton from '~/features/ecosystem/AddToFavoritesButton'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showToast, ToastDuration } from '~/utils/layout'

import { INJECTED_JAVASCRIPT } from './injectedJs'

interface DAppWebViewScreenProps extends NativeStackScreenProps<RootStackParamList, 'DAppWebViewScreen'>, ScreenProps {}

const DAppWebViewScreen = ({ navigation, route, ...props }: DAppWebViewScreenProps) => {
  const { dAppUrl: _dAppUrl, dAppName } = route.params
  const dAppUrl = 'http://localhost:3000/'
  const webViewRef = useRef<WebView>(null)
  const { setIsInEcosystemInAppBrowser } = useWalletConnectContext()

  const [currentUrl, setCurrentUrl] = useState(dAppUrl)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  useDetectWCUrlInClipboardAndPair()

  useFocusEffect(
    useCallback(() => {
      setIsInEcosystemInAppBrowser(true)

      return () => setIsInEcosystemInAppBrowser(false)
    }, [setIsInEcosystemInAppBrowser])
  )

  if (!dAppUrl) return null

  const handleGoBack = () => webViewRef.current?.goBack()

  const handleGoForward = () => webViewRef.current?.goForward()

  const handleReload = () => webViewRef.current?.reload()

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)
    setCanGoForward(navState.canGoForward)
  }

  return (
    <Screen {...props}>
      <BrowserHeader dAppName={dAppName} currentUrl={currentUrl} />
      <WebViewStyled
        ref={webViewRef}
        source={{ uri: dAppUrl }}
        allowsBackForwardNavigationGestures
        pullToRefreshEnabled
        onLoad={(e) => setCurrentUrl(e.nativeEvent.url)}
        onNavigationStateChange={handleNavigationStateChange}
        // This is a script that runs before the web page loads for the first time. It only runs once, even if the page is reloaded or navigated away. This is useful if you want to inject anything into the window, localstorage, or document prior to the web code executing.
        // Warning On Android, this may work, but it is not 100% reliable (see #1609 and #1099). Consider using injectedJavaScriptObject instead.
        // See: https://github.com/react-native-webview/react-native-webview/blob/master/docs/Guide.md#communicating-between-js-and-native
        // Ledger Live doesn't seem to use it: https://github.com/LedgerHQ/ledger-live/blob/108556d150ae1200e98077fecc2b6357969ecb4f/apps/ledger-live-mobile/src/components/Web3AppWebview/WalletAPIWebview.tsx#L84
        injectedJavaScriptBeforeContentLoaded={`
          window.mobileWalletInjectedObject = {
            sendMessageToMobileWallet: function (message) {
              window.ReactNativeWebView.postMessage(JSON.stringify(message))
            }
          };

          ${INJECTED_JAVASCRIPT}
        `}
        onMessage={(event) => {
          console.log('event', event.nativeEvent.data)
          // TODO: handle message from dApp
        }}
      />
      <BrowserFooter
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onReload={handleReload}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
      />
    </Screen>
  )
}

export default DAppWebViewScreen

interface BrowserHeaderProps {
  dAppName: string
  currentUrl: string
}

const BrowserHeader = ({ dAppName, currentUrl }: BrowserHeaderProps) => {
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  return (
    <BrowserHeaderStyled style={{ paddingTop: insets.top }}>
      <Button onPress={navigation.goBack} iconProps={{ name: 'arrow-left' }} squared compact />
      <Url truncate color="secondary">
        {currentUrl}
      </Url>
      <AddToFavoritesButton dAppName={dAppName} />
    </BrowserHeaderStyled>
  )
}

interface BrowserFooterProps {
  onGoBack: () => void
  onGoForward: () => void
  onReload: () => void
  canGoBack: boolean
  canGoForward: boolean
}

const BrowserFooter = ({ onGoBack, onGoForward, onReload, canGoBack, canGoForward }: BrowserFooterProps) => (
  <BrowserBottomStyled>
    <ButtonsList>
      <Button onPress={onGoBack} iconProps={{ name: 'arrow-left' }} squared type="transparent" disabled={!canGoBack} />
      <Button
        onPress={onGoForward}
        iconProps={{ name: 'arrow-right' }}
        squared
        type="transparent"
        disabled={!canGoForward}
      />
    </ButtonsList>
    <Button onPress={onReload} iconProps={{ name: 'refresh-cw' }} squared type="transparent" />
  </BrowserBottomStyled>
)

const BrowserHeaderStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding-left: ${DEFAULT_MARGIN}px;
  padding-right: ${DEFAULT_MARGIN}px;
  padding-bottom: 5px;
  gap: ${DEFAULT_MARGIN}px;
`

const BrowserBottomStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 10px ${DEFAULT_MARGIN}px;
  gap: ${DEFAULT_MARGIN}px;
`

const Url = styled(AppText)`
  flex-shrink: 1;
`

const ButtonsList = styled.View`
  flex-direction: row;
  gap: 5px;
  align-items: center;
`

const useDetectWCUrlInClipboardAndPair = () => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { pairWithDapp } = useWalletConnectContext()
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  useEffect(() => {
    const checkClipboard = async () => {
      const content = (await Clipboard.hasStringAsync()) ? await Clipboard.getStringAsync() : ''

      if (content.startsWith('wc:')) {
        Clipboard.setStringAsync('')

        if (!isWalletConnectEnabled) {
          showToast({
            text1: t('Experimental feature'),
            text2: t('WalletConnect is an experimental feature. You can enable it in the settings.'),
            type: 'info',
            visibilityTime: ToastDuration.LONG,
            onPress: () => navigation.navigate('SettingsScreen')
          })
        } else {
          dispatch(activateAppLoading(t('Connecting')))

          await pairWithDapp(content)

          dispatch(deactivateAppLoading())
        }
      }
    }

    checkClipboard()

    const intervalId = setInterval(checkClipboard, 1000)

    return () => clearInterval(intervalId)
  }, [dispatch, isWalletConnectEnabled, navigation, pairWithDapp, t])
}

const WebViewStyled = styled(WebView)`
  flex: 1;
`
