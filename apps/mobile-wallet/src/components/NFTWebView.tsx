import { memo } from 'react'
import { DimensionValue, View } from 'react-native'
import WebView from 'react-native-webview'

import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface NFTWebViewProps {
  imageUri: string
  size?: DimensionValue
}

const NFTWebView = ({ imageUri, size = '100%' }: NFTWebViewProps) => (
  <View style={{ width: size, height: size }}>
    <WebView
      source={{ html: `<img src="${imageUri}" />` }}
      style={{
        width: size,
        height: size,
        borderRadius: BORDER_RADIUS_SMALL,
        backgroundColor: 'transparent'
      }}
      injectedJavaScript={
        "const meta = document.createElement('meta'); meta.setAttribute('content', 'width=width, initial-scale=1, maximum-scale=1, user-scalable=1'); meta.setAttribute('name', 'viewport'); document.getElementsByTagName('head')[0].appendChild(meta); "
      }
      javaScriptEnabled={false}
      startInLoadingState={true}
      javaScriptCanOpenWindowsAutomatically={false}
      allowFileAccess={false}
      allowFileAccessFromFileURLs={false}
      allowUniversalAccessFromFileURLs={false}
      allowsAirPlayForMediaPlayback={false}
      allowsBackForwardNavigationGestures={false}
      allowsFullscreenVideo={false}
      allowsInlineMediaPlayback={false}
      allowsLinkPreview={false}
      allowsProtectedMedia={false}
      scrollEnabled={false}
      scalesPageToFit={false}
      onMessage={() => {}}
    />
  </View>
)

export default memo(NFTWebView)
