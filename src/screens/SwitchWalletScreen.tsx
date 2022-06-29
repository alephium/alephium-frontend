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
import { useEffect, useState } from 'react'
import { Text, TouchableWithoutFeedback, View } from 'react-native'
import styled from 'styled-components/native'

import Button from '../components/buttons/Button'
import Screen from '../components/layout/Screen'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { getStoredWalletById, getWalletsMetadata } from '../storage/wallets'
import { activeWalletChanged } from '../store/activeWalletSlice'
import { methodSelected, WalletGenerationMethod } from '../store/walletGenerationSlice'
import { WalletMetadata } from '../types/wallet'

type ScreenProps = StackScreenProps<RootStackParamList, 'SwitchWalletScreen'>

const SwitchWalletScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const wallets = useSortedWallets()

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleWalletItemPress = async (walletId: string) => {
    try {
      const storedWallet = await getStoredWalletById(walletId)
      if (!storedWallet) return

      if (storedWallet.authType === 'pin') {
        navigation.navigate('LoginScreen', { storedWallet })
      } else if (storedWallet.authType === 'biometrics') {
        dispatch(activeWalletChanged(storedWallet))
        navigation.navigate('DashboardScreen')
      } else {
        throw new Error('Unknown auth type')
      }
    } catch (e) {
      console.error('Could not switch wallets', e)
    }
  }

  return (
    <Screen>
      <ScreenSection>
        <Title>Wallets</Title>
        <Subtitle>Switch to another wallet?</Subtitle>
      </ScreenSection>
      <ScreenSection fill>
        <WalletsList>
          {wallets.map((wallet, index) => (
            <TouchableWithoutFeedback key={wallet.id} onPress={() => handleWalletItemPress(wallet.id)}>
              <WalletListItem>
                <RadioButton>{index === 0 && <RadioButtonChecked />}</RadioButton>
                <WalletName>{wallet.name}</WalletName>
              </WalletListItem>
            </TouchableWithoutFeedback>
          ))}
        </WalletsList>
      </ScreenSection>
      <ScreenSection>
        <Buttons>
          <NewWalletButton title="New wallet" onPress={() => handleButtonPress('create')} />
          <ImportWalletButton title="Import wallet" onPress={() => handleButtonPress('import')} />
        </Buttons>
      </ScreenSection>
    </Screen>
  )
}

export default SwitchWalletScreen

const useSortedWallets = () => {
  const [wallets, setWallets] = useState<WalletMetadata[]>([])
  const activeWalletId = useAppSelector((state) => state.activeWallet.metadataId)
  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId)

  const sortedWallets = wallets
    .filter((wallet) => wallet.id !== activeWalletId)
    .sort((a, b) => a.name.localeCompare(b.name))
  if (activeWallet) sortedWallets.unshift(activeWallet)

  useEffect(() => {
    const getWallets = async () => {
      const wallets = await getWalletsMetadata()
      setWallets(wallets)
    }
    getWallets()
  }, [])

  return sortedWallets
}

const Title = styled(Text)`
  font-weight: 600;
  font-size: 26px;
`

const Subtitle = styled(Text)`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
`

const ScreenSection = styled(View)<{ fill?: boolean }>`
  padding: 29px 20px;

  ${({ fill }) => fill && 'flex: 1;'}
`

const Buttons = styled.View`
  display: flex;
  flex-direction: row;
`

const NewWalletButton = styled(Button)`
  flex: 1;
  margin-right: 5px;
`

const ImportWalletButton = styled(Button)`
  flex: 1;
  margin-left: 5px;
`

const WalletsList = styled(View)``

const WalletListItem = styled(View)`
  padding: 16px 18px;
  background-color: ${({ theme }) => theme.bg.primary};
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 11px;
  border-radius: 9px;
`

const WalletName = styled(Text)`
  font-weight: 500;
  font-size: 14px;
`

const RadioButton = styled(View)`
  width: 19px;
  height: 19px;
  border-radius: 19px;
  background-color: ${({ theme }) => theme.bg.secondary};
  margin-right: 21px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`

const RadioButtonChecked = styled(View)`
  width: 13px;
  height: 13px;
  border-radius: 13px;
  background-color: ${({ theme }) => theme.font.primary};
`
