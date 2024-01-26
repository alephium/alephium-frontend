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

import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useState } from 'react'
import { Portal } from 'react-native-portalize'
import styled from 'styled-components/native'

import backupAnimationSrc from '~/animations/lottie/backup.json'
import AuthenticationModal from '~/components/AuthenticationModal'
import Button from '~/components/buttons/Button'
import FooterButtonContainer from '~/components/buttons/FooterButtonContainer'
import BottomModal from '~/components/layout/BottomModal'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import MnemonicModal from '~/screens/Settings/MnemonicModal'

interface BackupIntroScreenProps
  extends StackScreenProps<SendNavigationParamList, 'BackupIntroScreen'>,
    ScrollScreenProps {}

const BackupIntroScreen = ({ navigation, ...props }: BackupIntroScreenProps) => {
  const [isAuthenticationModalVisible, setIsAuthenticationModalVisible] = useState(false)
  const [isMnemonicModalVisible, setIsMnemonicModalVisible] = useState(false)

  return (
    <>
      <ScrollScreen fill {...props}>
        <ScreenSection fill centered verticallyCentered>
          <StyledAnimation source={backupAnimationSrc} autoPlay />
        </ScreenSection>
        <ScreenSection fill>
          <CenteredInstructions
            instructions={[
              {
                text: 'In the following screens you will see and verify your secret recover phrase.',
                type: 'secondary'
              },
              { text: 'Write it down and store it in a safe place.', type: 'primary' },
              {
                text: 'Why is this important?',
                type: 'link',
                url: 'https://docs.alephium.org/frequently-asked-questions#why-is-it-important-to-back-up-your-secret-recovery-phrase'
              }
            ]}
          />
        </ScreenSection>
        <FooterButtonContainer>
          <Button
            title="Show secret recovery phrase"
            iconProps={{ name: 'key' }}
            type="primary"
            variant="highlight"
            onPress={() => setIsAuthenticationModalVisible(true)}
          />
        </FooterButtonContainer>
      </ScrollScreen>

      <AuthenticationModal
        visible={isAuthenticationModalVisible}
        authenticationPrompt="Verify it's you"
        loadingText="Verifying..."
        onConfirm={() => {
          setIsAuthenticationModalVisible(false)
          setIsMnemonicModalVisible(true)
        }}
        onClose={() => setIsAuthenticationModalVisible(false)}
      />

      <Portal>
        <BottomModal
          isOpen={isMnemonicModalVisible}
          onClose={() => setIsMnemonicModalVisible(false)}
          Content={(props) => (
            <MnemonicModal
              {...props}
              onVerifyButtonPress={() => {
                props.onClose && props.onClose()
                navigation.navigate('VerifyMnemonicScreen')
              }}
            />
          )}
        />
      </Portal>
    </>
  )
}

export default BackupIntroScreen

const StyledAnimation = styled(LottieView)`
  width: 50%;
`
