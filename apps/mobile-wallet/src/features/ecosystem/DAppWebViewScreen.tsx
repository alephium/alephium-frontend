import { useFocusEffect } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useCallback, useState } from 'react'
import { WebViewNavigation } from 'react-native-webview'

import Screen, { ScreenProps } from '~/components/layout/Screen'
import { useWalletConnectContext } from '~/contexts/walletConnect/WalletConnectContext'
import DappBrowserFooter from '~/features/ecosystem/dAppBrowser/DappBrowserFooter'
import DappBrowserHeader from '~/features/ecosystem/dAppBrowser/DappBrowserHeader'
import DappBrowserWebView from '~/features/ecosystem/dAppBrowser/DappBrowserWebView'
import { DappBrowserContextProvider } from '~/features/ecosystem/dAppMessaging/DappBrowserContext'
import RootStackParamList from '~/navigation/rootStackRoutes'

interface DAppWebViewScreenProps extends NativeStackScreenProps<RootStackParamList, 'DAppWebViewScreen'>, ScreenProps {}

const DAppWebViewScreen = ({ navigation, route, ...props }: DAppWebViewScreenProps) => {
  const { dAppUrl: dAppUrlFromParams, dAppName: dAppNameFromParams } = route.params
  const { setIsInEcosystemInAppBrowser } = useWalletConnectContext()

  const [currentUrl, setCurrentUrl] = useState(dAppUrlFromParams)
  const [currentDappName, setCurrentDappName] = useState<string | undefined>(dAppNameFromParams)
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  useFocusEffect(
    useCallback(() => {
      setIsInEcosystemInAppBrowser(true)

      return () => setIsInEcosystemInAppBrowser(false)
    }, [setIsInEcosystemInAppBrowser])
  )

  const handleUrlChange = useCallback((url: string) => {
    setCurrentUrl(url)
    setCurrentDappName(undefined)
  }, [])

  if (!currentUrl) return null

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    setCanGoBack(navState.canGoBack)
    setCanGoForward(navState.canGoForward)
  }

  return (
    <DappBrowserContextProvider dAppUrl={currentUrl} dAppName={currentDappName}>
      <Screen {...props}>
        <DappBrowserHeader dAppName={currentDappName} currentUrl={currentUrl} onUrlChange={handleUrlChange} />
        <DappBrowserWebView
          dAppUrl={currentUrl}
          onNavigationStateChange={handleNavigationStateChange}
          onLoad={(e) => setCurrentUrl(e.nativeEvent.url)}
        />
        <DappBrowserFooter canGoBack={canGoBack} canGoForward={canGoForward} />
      </Screen>
    </DappBrowserContextProvider>
  )
}

export default DAppWebViewScreen
