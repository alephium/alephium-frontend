import WebView, { WebViewProps } from 'react-native-webview'
import styled from 'styled-components/native'

import { useDappBrowserContext } from '~/features/ecosystem/dAppMessaging/DappBrowserContext'
import { getInjectedJavaScript } from '~/features/ecosystem/dAppMessaging/injectedJs'
import useHandleDappMessages from '~/features/ecosystem/dAppMessaging/useHandleDappMessages'

interface DappBrowserWebViewProps extends WebViewProps {
  dAppUrl: string
}

const DappBrowserWebView = ({ dAppUrl, ...props }: DappBrowserWebViewProps) => {
  const webViewRef = useDappBrowserContext()
  const { handleDappMessage } = useHandleDappMessages()

  return (
    <WebViewStyled
      ref={webViewRef}
      source={{ uri: dAppUrl }}
      allowsBackForwardNavigationGestures
      pullToRefreshEnabled
      injectedJavaScriptBeforeContentLoaded={getInjectedJavaScript()}
      onMessage={handleDappMessage}
      {...props}
    />
  )
}

export default DappBrowserWebView

const WebViewStyled = styled(WebView)`
  flex: 1;
`
