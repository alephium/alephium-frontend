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
      injectedJavaScriptBeforeContentLoadedForMainFrameOnly
      onShouldStartLoadWithRequest={(request) => {
        // Only constrain top-frame navigations (the provider is injected there): keep the user on real https
        // origins, blocking http downgrades and exotic schemes (javascript:, data:, file:). Sub-frames are allowed.
        if (!request.isTopFrame) return true

        return request.url.startsWith('https://') || request.url === 'about:blank'
      }}
      onMessage={handleDappMessage}
      {...props}
    />
  )
}

export default DappBrowserWebView

const WebViewStyled = styled(WebView)`
  flex: 1;
`
