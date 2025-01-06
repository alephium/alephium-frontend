import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BackHandler, Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView, { WebViewNavigation } from 'react-native-webview'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import ScreenTitle from '~/components/layout/ScreenTitle'
import LinkToWeb from '~/components/text/LinkToWeb'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { selectDefaultAddress } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

const BuyModal = withModal(({ id }) => {
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
    'https://alephium.banxa.com/' +
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
    <BottomModal modalId={id} title={t('Buy')} maximisedContent noPadding contentContainerStyle={{ flex: 1 }}>
      {!isDisclaimerAccepted ? (
        <DisclaimerContent>
          <ScreenTitle title={t('Disclaimer')} />
          <TextContainer>
            <AppText>
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
          </TextContainer>
          <BottomButtons fullWidth>
            <Button
              title={t("Alright, let's get to it.")}
              onPress={() => setIsDisclaimerAccepted(true)}
              variant="highlight"
              style={{ marginBottom: insets.bottom }}
            />
          </BottomButtons>
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
    </BottomModal>
  )
})

export default BuyModal

const DisclaimerContent = styled.View`
  flex: 1;
  padding: ${DEFAULT_MARGIN}px;
`

const TextContainer = styled.View`
  flex: 1;
`
