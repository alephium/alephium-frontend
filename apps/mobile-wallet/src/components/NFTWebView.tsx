/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { memo } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'

import { BORDER_RADIUS_SMALL } from '~/style/globalStyle'

interface NFTWebViewProps {
  imageUri: string
  size: number
}

const NFTWebView = ({ imageUri, size }: NFTWebViewProps) => (
  <View>
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
