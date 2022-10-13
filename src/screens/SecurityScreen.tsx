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
import { shuffle } from 'lodash'
import { AlertTriangle } from 'lucide-react-native'
import { useEffect, useState } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import Fade from '../components/Fade'
import Screen from '../components/layout/Screen'
import Notice from '../components/Notice'
import OrderedListInput from '../components/OrderedListInput'
import OrderedTable from '../components/OrderedTable'
import Toggle from '../components/Toggle'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { walletStored } from '../store/activeWalletSlice'

interface ScreenProps extends StackScreenProps<RootStackParamList, 'SecurityScreen'> {
  style?: StyleProp<ViewStyle>
}

type State = 'hidden' | 'revealed' | 'backedup' | 'verified'

const SecurityScreen = ({ navigation, style }: ScreenProps) => {
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const activeWallet = useAppSelector((state) => state.activeWallet)
  const [wordsToVerify, setWordsToVerify] = useState<string[]>([])
  const [state, setState] = useState<State>('hidden')

  const { isMnemonicBackedUp, name, mnemonic, authType } = activeWallet

  const [isUnderstood, setIsUnderstood] = useState(isMnemonicBackedUp)
  const [isWrongMatch, setIsWrongMatch] = useState(false)

  const isRevealed = state === 'revealed' || state === 'backedup'

  const nextState: Record<State, State> = {
    hidden: 'revealed',
    revealed: isMnemonicBackedUp ? 'hidden' : 'backedup',
    backedup: 'verified',
    verified: 'verified'
  }

  const revealButtonText: Record<State, string> = {
    hidden: 'Press to reveal',
    revealed: !isMnemonicBackedUp ? 'Next' : 'Press to hide',
    backedup: isWrongMatch ? 'Wrong match' : 'Confirm',
    verified: ''
  }

  const handlePress: Record<State, () => void> = {
    hidden: () => setState(nextState[state]),
    revealed: () => setState(nextState[state]),
    backedup: () => {
      if (wordsToVerify.join(' ') == mnemonic) {
        setState(nextState[state])
        return
      }
      setIsWrongMatch(true)
      setTimeout(() => {
        setIsWrongMatch(false)
      }, 1000)
    },
    verified: () => setState(nextState[state])
  }

  useEffect(() => {
    if (state === 'verified') {
      dispatch(walletStored({ name, mnemonic, authType, isMnemonicBackedUp: true })).then(() => {
        navigation.navigate('InWalletScreen')
      })
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const mnemonicComponent = {
    hidden: null,
    revealed: <OrderedTable items={mnemonic.split(' ')} />,
    backedup: (
      <OrderedListInput items={shuffle(mnemonic.split(' '))} onChange={(words: string[]) => setWordsToVerify(words)} />
    ),
    verified: null
  }

  if (state === 'verified') return null

  return (
    <Screen style={style}>
      <Fade visible={!isRevealed}>
        <CellNotices>
          {!isMnemonicBackedUp && (
            <Notice
              icon={<AlertTriangle size={64} color={theme.font.primary} />}
              title="Action to take"
              body="Backup your recovery phrase to avoid losing access to your wallet"
            />
          )}
          <CenterText>Your secret recovery phrase is the only way to recover your wallet.</CenterText>
          <BoldText>Don&apos;t lose it, and don&apos;t share it with anyone.</BoldText>
        </CellNotices>
        <CellReveal>
          <ToggleStyled onValueChange={() => setIsUnderstood(!isUnderstood)} value={isUnderstood} />
          <AppText onPress={() => setIsUnderstood(!isUnderstood)}>I&apos;ve read and understood the above.</AppText>
        </CellReveal>
      </Fade>
      <Button disabled={!isUnderstood} title={revealButtonText[state]} onPress={handlePress[state]} />
      <Fade modal visible={isRevealed}>
        {mnemonicComponent[state]}
      </Fade>
    </Screen>
  )
}

export default styled(SecurityScreen)`
  background-color: #f7d1b6;
  margin: 20px;
  justify-content: space-between;
`

const CenterText = styled(AppText)`
  text-align: center;
  margin: 20px 0;
`

const BoldText = styled(AppText)`
  font-weight: bold;
  text-align: center;
`

const CellNotices = styled.View`
  align-items: center;
  flex-grow: 1;
  width: 80%;
`

const CellReveal = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 40px;
`

const ToggleStyled = styled(Toggle)`
  margin-right: 12px;
`
