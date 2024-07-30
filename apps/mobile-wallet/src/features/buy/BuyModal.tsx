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

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BackHandler, Platform } from 'react-native'
import { Portal } from 'react-native-portalize'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomModal, { BottomModalProps } from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import ScreenTitle from '~/components/layout/ScreenTitle'
import { useAppSelector } from '~/hooks/redux'
import { selectDefaultAddress } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BuyModalProps extends Omit<BottomModalProps, 'Content'> {}

const BuyModal = (props: BuyModalProps) => {
  const { t } = useTranslation()
  const webViewRef = useRef<WebView>(null)
  const theme = useTheme()
  const insets = useSafeAreaInsets()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false)

  const onAndroidBackPress = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack()
      return true // prevent default behavior (exit app)
    }
    return false
  }

  useEffect(() => {
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
      }
    }
  }, [])

  const banxaURL =
    'https://alephium.banxa-sandbox.com/' +
    `?walletAddress=${defaultAddress?.hash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.primary.slice(1)}` +
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent}` +
    `&secondaryColor=${theme.global.complementary}`

  return (
    <Portal>
      <BottomModal
        {...props}
        Content={(props) => (
          <ModalContent {...props} contentContainerStyle={{ flex: 1, paddingTop: 0 }}>
            {!isDisclaimerAccepted && (
              <DisclaimerContent>
                <ScreenTitle title={t('Disclaimer')} />
                <AppText style={{ flex: 1 }}>
                  {t(
                    'You are about to use an external service provider, banxa.com, which allows you to buy ALPH right from your wallet. Alephium has no control over Banxa activities. Please reach Banxa for more information.'
                  )}
                </AppText>
                <Button
                  title={t("Alright, let's get to it.")}
                  onPress={() => setIsDisclaimerAccepted(true)}
                  variant="highlight"
                  style={{ marginBottom: insets.bottom }}
                />
              </DisclaimerContent>
            )}
            <WebView
              ref={webViewRef}
              source={{
                uri: banxaURL
              }}
              allowsInlineMediaPlayback
              enableApplePay
              mediaPlaybackRequiresUserAction={false}
              containerStyle={{ padding: 0 }}
              allowsBackForwardNavigationGestures
              cacheEnabled={false}
            />
          </ModalContent>
        )}
        title={t('Buy')}
        maximisedContent
        noPadding
      />
    </Portal>
  )
}

export default BuyModal

const DisclaimerContent = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 1;
  background-color: ${({ theme }) => theme.bg.primary};
  padding: ${DEFAULT_MARGIN}px;
`
