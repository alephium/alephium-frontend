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
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import animationSrc from '~/animations/lottie/success.json'
import HighlightButton from '~/components/buttons/HighlightButton'
import { ScreenProps, ScreenSection } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useAppSelector } from '~/hooks/redux'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { storeIsNewWallet } from '~/persistent-storage/wallet'
import { resetNavigation } from '~/utils/navigation'

interface NewWalletSuccessScreenProps
  extends StackScreenProps<RootStackParamList, 'NewWalletSuccessScreen'>,
    ScreenProps {}

const NewWalletSuccessScreen = ({ navigation, ...props }: NewWalletSuccessScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const wasWalletMetadataRestored = useAppSelector((s) => s.wallet.metadataRestored)
  const theme = useTheme()
  const { t } = useTranslation()

  useEffect(() => {
    try {
      storeIsNewWallet(method === 'create')
    } catch (e) {
      console.error(e)
    }
  }, [method])

  return (
    <ScrollScreen fill {...props}>
      <AnimationContainer style={{ marginTop: 100 }}>
        <StyledAlephiumLogo color={theme.font.primary} />
        <StyledAnimation source={animationSrc} autoPlay />
      </AnimationContainer>
      <CenteredInstructions
        instructions={[
          {
            text: `${t(wasWalletMetadataRestored ? 'Welcome back to Alephium!' : 'Welcome to Alephium!')} 🎉`,
            type: 'primary'
          },
          {
            text: t(wasWalletMetadataRestored ? 'Enjoy your restored wallet!' : 'Enjoy your new wallet!'),
            type: 'secondary'
          }
        ]}
        stretch
        fontSize={19}
      />
      <ActionsContainer>
        <ScreenSection>
          <HighlightButton title={t("Let's go!")} wide onPress={() => resetNavigation(navigation)} />
        </ScreenSection>
      </ActionsContainer>
    </ScrollScreen>
  )
}

export default NewWalletSuccessScreen

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAlephiumLogo = styled(AlephiumLogo)`
  position: absolute;
  width: 70%;
  height: 70%;
`

const StyledAnimation = styled(LottieView)`
  width: 80%;
  height: 100%;
`

const ActionsContainer = styled.View`
  flex: 1;
  justify-content: flex-end;
`
