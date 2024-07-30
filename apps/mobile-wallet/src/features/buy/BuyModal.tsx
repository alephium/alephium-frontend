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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Portal } from 'react-native-portalize'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WebView from 'react-native-webview'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import BottomModal, { BottomModalProps } from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import ScreenTitle from '~/components/layout/ScreenTitle'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface BuyModalProps extends Omit<BottomModalProps, 'Content'> {}

const BuyModal = (props: BuyModalProps) => {
  const { t } = useTranslation()
  const insets = useSafeAreaInsets()
  const [isDisclaimerAccepted, setIsDisclaimerAccepted] = useState(false)

  return (
    <Portal>
      <BottomModal
        {...props}
        Content={(props) => (
          <ModalContent {...props} contentContainerStyle={{ flex: 1 }}>
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
              source={{ uri: 'https://alephium.banxa-sandbox.com' }}
              allowsInlineMediaPlayback
              enableApplePay
              mediaPlaybackRequiresUserAction={false}
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
