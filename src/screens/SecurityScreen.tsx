/*
Copyright 2018 - 2022 The Alephium Authors
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
import { AlertTriangle } from 'lucide-react-native'
import { usePostHog } from 'posthog-react-native'
import { useCallback, useState } from 'react'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import InfoBox from '~/components/InfoBox'
import Screen, { BottomScreenSection, ScreenProps } from '~/components/layout/Screen'
import { ScreenSection } from '~/components/layout/Screen'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import OrderedTable from '~/components/OrderedTable'
import Toggle from '~/components/Toggle'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { persistWalletMetadata } from '~/persistent-storage/wallets'
import { mnemonicBackedUp } from '~/store/activeWalletSlice'

interface SecurityScreenProps extends StackScreenProps<RootStackParamList, 'SecurityScreen'>, ScreenProps {}

const SecurityScreen = ({ navigation, ...props }: SecurityScreenProps) => {
  const dispatch = useAppDispatch()
  const isMnemonicBackedUp = useAppSelector((s) => s.activeWallet.isMnemonicBackedUp)
  const mnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const metadataId = useAppSelector((s) => s.activeWallet.metadataId)
  const posthog = usePostHog()

  const [isUnderstood, setIsUnderstood] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)

  const handleBackupConfirmation = useCallback(async () => {
    if (!isMnemonicBackedUp) {
      await persistWalletMetadata(metadataId, { isMnemonicBackedUp: true })
      dispatch(mnemonicBackedUp())

      posthog?.capture('Backed-up mnemonic')
    }

    navigation.navigate('InWalletTabsNavigation')
  }, [isMnemonicBackedUp, navigation, metadataId, dispatch, posthog])

  return (
    <Screen {...props}>
      <ScreenSection fill>
        <Messages>
          {!isMnemonicBackedUp && (
            <InfoBox title="Action to take" Icon={AlertTriangle} bgColor="#f0b68d">
              <AppText bold>Backup your recovery phrase to avoid losing access to your wallet</AppText>
            </InfoBox>
          )}
          <AdviceTexts>
            <CenteredText>Your secret recovery phrase is the only way to recover your wallet.</CenteredText>
            <BoldText>Don&apos;t lose it, and don&apos;t share it with anyone.</BoldText>
          </AdviceTexts>
        </Messages>
        <ConsentSection>
          <ToggleStyled onValueChange={() => setIsUnderstood(!isUnderstood)} value={isUnderstood} />
          <ConsentText onPress={() => setIsUnderstood(!isUnderstood)}>
            I understand and I&apos;m ready to write down my recovery phrase.
          </ConsentText>
        </ConsentSection>
      </ScreenSection>
      <BottomScreenSection>
        <Button disabled={!isUnderstood} title="Reveal secret phrase" onPress={() => setShowMnemonic(true)} />
      </BottomScreenSection>
      <ModalWithBackdrop animationType="fade" visible={showMnemonic} closeModal={() => setShowMnemonic(false)}>
        <SecretPhraseModalContent>
          <ScreenSectionStyled fill>
            <OrderedTable items={mnemonic.split(' ')} />
          </ScreenSectionStyled>
          <BottomScreenSection>
            <ButtonsRow>
              <Button title="Go back" onPress={() => setShowMnemonic(false)} />
              <Button title="I wrote it down" onPress={handleBackupConfirmation} />
            </ButtonsRow>
          </BottomScreenSection>
        </SecretPhraseModalContent>
      </ModalWithBackdrop>
    </Screen>
  )
}

export default styled(SecurityScreen)`
  background-color: ${({ theme }) => theme.global.pale};
`

const Messages = styled.View`
  flex: 1;
`

const ConsentSection = styled.View`
  flex-direction: row;
  align-items: center;
  margin: 0 40px 22px;
`

const ToggleStyled = styled(Toggle)`
  margin-right: 12px;
`

const AdviceTexts = styled.View`
  margin: 0 64px;
  flex: 1;
  justify-content: center;
`

const CenteredText = styled(AppText)`
  text-align: center;
`

const BoldText = styled(CenteredText)`
  margin-top: 20px;
  font-weight: bold;
`

const ConsentText = styled(AppText)`
  flex-shrink: 1;
`

const SecretPhraseModalContent = styled.View`
  flex: 1;
  width: 100%;
  background-color: #f7d1b6;
`

const ScreenSectionStyled = styled(ScreenSection)`
  align-items: center;
  justify-content: center;
`
