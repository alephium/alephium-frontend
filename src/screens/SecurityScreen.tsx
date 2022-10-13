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
import { useCallback, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import Screen, { BottomScreenSection } from '../components/layout/Screen'
import { ScreenSection } from '../components/layout/Screen'
import ModalWithBackdrop from '../components/ModalWithBackdrop'
import OrderedTable from '../components/OrderedTable'
import Toggle from '../components/Toggle'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { mnemonicBackedUp } from '../store/activeWalletSlice'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SecurityScreen'> {
  style?: StyleProp<ViewStyle>
}

const SecurityScreen = ({ navigation, style }: ScreenProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const { isMnemonicBackedUp, mnemonic } = activeWallet
  const [isUnderstood, setIsUnderstood] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)

  const handleBackupConfirmation = useCallback(async () => {
    if (!isMnemonicBackedUp) await dispatch(mnemonicBackedUp(true))

    navigation.navigate('InWalletScreen')
  }, [dispatch, isMnemonicBackedUp, navigation])

  return (
    <Screen style={style}>
      <ScreenSection fill>
        <Messages>
          {!isMnemonicBackedUp && (
            <NoticeBox>
              <NoticeIcon>
                <AlertTriangle size={64} color={theme.font.primary} />
              </NoticeIcon>
              <NoticeText>
                <NoticeTitle>Action to take</NoticeTitle>
                <NoticeBody>Backup your recovery phrase to avoid losing access to your wallet</NoticeBody>
              </NoticeText>
            </NoticeBox>
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
              <Button title="I wrote it down" onPress={handleBackupConfirmation} gradient />
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

const NoticeBox = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #f0b68d;
  border-radius: 12px;
  padding: 38px 33px;
`

const NoticeIcon = styled.View`
  align-items: center;
  margin-right: 20px;
  flex-shrink: 0;
  flex-grow: 1;
`

const NoticeText = styled.View`
  flex-shrink: 1;
`

const NoticeTitle = styled(AppText)`
  font-weight: 700;
  font-size: 18px;
  margin-bottom: 12px;
`

const NoticeBody = styled(AppText)`
  font-weight: 600;
  font-size: 16px;
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
 flex: 1
 width: 100%;
 background-color: #f7d1b6;
`

const ScreenSectionStyled = styled(ScreenSection)`
  align-items: center;
  justify-content: center;
`
