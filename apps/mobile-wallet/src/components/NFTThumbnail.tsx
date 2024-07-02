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

import { NFT } from '@alephium/shared'
import { colord } from 'colord'
import { Image } from 'expo-image'
import { openBrowserAsync } from 'expo-web-browser'
import { CameraOff } from 'lucide-react-native'
import { Skeleton } from 'moti/skeleton'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, TouchableOpacity, View } from 'react-native'
import { Portal } from 'react-native-portalize'
import { WebView } from 'react-native-webview'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomModal from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import { BORDER_RADIUS_SMALL, DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTThumbnailProps {
  nft: NFT
  size: number
}

const attributeGap = 12
const screenPadding = 20
const fullSize = Dimensions.get('window').width - DEFAULT_MARGIN * 4

const NFTThumbnail = ({ nft, size }: NFTThumbnailProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState()

  const attributeWidth = (Dimensions.get('window').width - (attributeGap + screenPadding * 2 + DEFAULT_MARGIN * 2)) / 2
  const isDataUri = nft.image.startsWith('data:image/')

  return (
    <>
      <TouchableOpacity onPress={() => setIsModalOpen(true)} style={{ position: 'relative' }}>
        {error ? (
          <NoImagePlaceholder size={size} />
        ) : isDataUri ? (
          <WebViewImage nft={nft} size={size} />
        ) : (
          <>
            <NFTThumbnailStyled
              style={{ width: size, height: size }}
              transition={500}
              source={{ uri: nft.image }}
              allowDownscaling
              onError={setError}
              onLoadStart={() => setIsLoading(true)}
              onLoadEnd={() => setIsLoading(false)}
            />
            {isLoading && (
              <View style={{ position: 'absolute' }}>
                <Skeleton show colorMode={theme.name} width={size} height={size} radius={BORDER_RADIUS_SMALL} />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
      <Portal>
        <BottomModal
          Content={(props) => (
            <ModalContent verticalGap {...props}>
              <ScreenSection>
                <BottomModalScreenTitle>{nft.name}</BottomModalScreenTitle>
              </ScreenSection>
              <ScreenSection>
                {error ? (
                  <NoImagePlaceholder size={fullSize} />
                ) : isDataUri ? (
                  <WebViewImage nft={nft} size={fullSize} />
                ) : (
                  <NFTFullSizeImage source={{ uri: nft.image }} contentFit="contain" />
                )}

                {nft.description && (
                  <NFTDescriptionContainer>
                    <AppText color="secondary" size={16}>
                      {nft.description}
                    </AppText>
                  </NFTDescriptionContainer>
                )}
                {nft.attributes && nft.attributes.length > 0 && (
                  <AttributesGrid>
                    {nft.attributes.map((attribute) => (
                      <Attribute key={attribute.trait_type} style={{ width: attributeWidth }}>
                        <AttributeType color="tertiary" semiBold>
                          {attribute.trait_type}
                        </AttributeType>
                        <AttributeValue semiBold>{attribute.value.toString()}</AttributeValue>
                      </Attribute>
                    ))}
                  </AttributesGrid>
                )}
              </ScreenSection>

              {!isDataUri && (
                <ScreenSection>
                  <Button title={t('View full size')} onPress={() => openBrowserAsync(nft.image)} />
                </ScreenSection>
              )}
            </ModalContent>
          )}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </Portal>
    </>
  )
}

const NoImagePlaceholder = ({ size }: Pick<NFTThumbnailProps, 'size'>) => (
  <NoImage style={{ width: size, height: size }}>
    <CameraOff color="gray" />
  </NoImage>
)

const WebViewImage = ({ nft, size }: NFTThumbnailProps) => (
  <WebView
    source={{ html: `<img src="${nft.image}" />` }}
    style={{ width: size, height: size, borderRadius: BORDER_RADIUS_SMALL }}
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
)

export default NFTThumbnail

const NFTThumbnailStyled = styled(Image)`
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const NFTFullSizeImage = styled(Image)`
  flex: 1;
  border-radius: ${BORDER_RADIUS_SMALL}px;
  aspect-ratio: 1;
`

const NFTDescriptionContainer = styled.View`
  margin-top: 20px;
  background-color: ${({ theme }) => theme.bg.highlight};
  padding: 10px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const AttributesGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${attributeGap}px;
  margin-top: 20px;
`

const Attribute = styled.View`
  background-color: ${({ theme }) => theme.bg.primary};
  padding: 10px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
`

const AttributeType = styled(AppText)`
  font-weight: 500;
  font-size: 14px;
`

const AttributeValue = styled(AppText)`
  margin-top: 2px;
`

const NoImage = styled.View`
  border-radius: ${BORDER_RADIUS_SMALL}px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => colord(theme.bg.back2).darken(0.07).toHex()};
`
