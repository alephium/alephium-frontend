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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BackHandler, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView, { WebViewNavigation } from 'react-native-webview'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ScreenTitle from '~/components/layout/ScreenTitle'
import LinkToWeb from '~/components/text/LinkToWeb'
import { closeModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModalWrapper from '~/features/modals/withModalWrapper'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import BottomModal from '~/modals/BottomModal'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const BuyModal = withModalWrapper(({ id, isOpen }) => {
  const { t } = useTranslation()
  const navigation = useNavigation<NavigationProp<InWalletTabsParamList>>()
  const theme = useTheme()
  const webViewRef = useRef<WebView>(null)
  const insets = useSafeAreaInsets()
  const defaultAddress = useAppSelector(selectDefaultAddress)
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const dispatch = useAppDispatch()
  const onClose = () => dispatch(closeModal({ id }))

  useEffect(() => {
    if (Platform.OS === 'android') {
      const onAndroidBackPress = () => {
        if (webViewRef.current) {
          webViewRef.current.goBack()
          return true // prevent default behavior (exit app)
        }
        return false
      }

      BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress)
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress)
      }
    }
  }, [])

  const banxaInitialURL =
    'https://alephium.banxa-sandbox.com/' +
    `?walletAddress=${defaultAddress.hash}` +
    `&theme=${theme.name}` +
    `&backgroundColor=${theme.bg.primary.slice(1)}` +
    `&textColor=${theme.font.primary.slice(1)}` +
    `&primaryColor=${theme.global.accent.slice(1)}` +
    `&secondaryColor=${theme.global.complementary.slice(1)}`

  useEffect(() => {
    if (!currentUrl) {
      setCurrentUrl(banxaInitialURL)
    }
  }, [defaultAddress, theme, currentUrl, banxaInitialURL])

  const handleNavigationChange = (e: WebViewNavigation) => {
    // Close modal if url equals default return URL configured in Banxa dashboard
    if (e.url.includes('alephium.org')) {
      navigation.navigate('ActivityScreen')
      setCurrentUrl(banxaInitialURL)
      onClose()
    } else {
      setCurrentUrl(e.url)
    }
  }

  return (
    <BottomModal
      id={id}
      isOpen={isOpen}
      title={t('Buy')}
      maximisedContent
      noPadding
      Content={(props) => (
        <ModalContent {...props} contentContainerStyle={{ flex: 1, paddingTop: 0 }}>
          {!isDisclaimerAccepted ? (
            <DisclaimerContent>
              <ScreenTitle title={t('Disclaimer')} />
              <AppText style={{ flex: 1 }}>
                <Trans
                  t={t}
                  i18nKey="banxaDisclaimer"
                  components={{
                    1: <LinkToWeb url="https://www.banxa.com" />
                  }}
                >
                  {
                    'You are about to access 3rd party services provided by <1>Banxa.com</1> through an in-app browser. Alephium does not control Banxa’s services. Banxa’s terms and conditions will apply, so please read and understand them before proceeding.'
                  }
                </Trans>
              </AppText>
              <Button
                title={t("Alright, let's get to it.")}
                onPress={() => setIsDisclaimerAccepted(true)}
                variant="highlight"
                style={{ marginBottom: insets.bottom }}
              />
            </DisclaimerContent>
          ) : (
            <WebView
              ref={webViewRef}
              source={{
                uri: currentUrl
              }}
              originWhitelist={['*']}
              allowsInlineMediaPlayback
              enableApplePay
              mediaPlaybackRequiresUserAction={false}
              containerStyle={{ padding: 0 }}
              allowsBackForwardNavigationGestures
              onNavigationStateChange={handleNavigationChange}
              setSupportMultipleWindows={false}
              nestedScrollEnabled
            />
          )}
        </ModalContent>
      )}
    />
  )
})

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
