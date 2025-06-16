import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Clipboard from 'expo-clipboard'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { WebViewNavigation } from 'react-native-webview'

import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import DappBrowserFooter from '~/features/ecosystem/dAppBrowser/DappBrowserFooter'
import DappBrowserHeader from '~/features/ecosystem/dAppBrowser/DappBrowserHeader'
import DappBrowserWebView from '~/features/ecosystem/dAppBrowser/DappBrowserWebView'
import { DappBrowserContextProvider } from '~/features/ecosystem/dAppMessaging/DappBrowserContext'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { showToast, ToastDuration } from '~/utils/layout'

interface DAppWebViewScreenProps extends NativeStackScreenProps<RootStackParamList, 'DAppWebViewScreen'>, ScreenProps {}

const DAppWebViewScreen = ({ navigation, route, ...props }: DAppWebViewScreenProps) => {
  const { dAppUrl, dAppName } = route.params

  const { setIsInEcosystemInAppBrowser } = useWalletConnectContext()

  const [currentUrl, setCurrentUrl] = useState(dAppUrl)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  useDetectWCUrlInClipboardAndPair() // TODO: Eventually we should remove this

  useFocusEffect(
    useCallback(() => {
      setIsInEcosystemInAppBrowser(true)

      return () => setIsInEcosystemInAppBrowser(false)
    }, [setIsInEcosystemInAppBrowser])
  )

  if (!dAppUrl) return null

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)
    setCanGoForward(navState.canGoForward)
  }

  return (
    <DappBrowserContextProvider dAppUrl={dAppUrl} dAppName={dAppName}>
      <Screen {...props}>
        <DappBrowserHeader dAppName={dAppName} currentUrl={currentUrl} />
        <DappBrowserWebView
          dAppName={dAppName}
          dAppUrl={dAppUrl}
          onNavigationStateChange={handleNavigationStateChange}
          onLoad={(e) => setCurrentUrl(e.nativeEvent.url)}
        />
        <DappBrowserFooter canGoBack={canGoBack} canGoForward={canGoForward} />
      </Screen>
    </DappBrowserContextProvider>
  )
}

export default DAppWebViewScreen

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
