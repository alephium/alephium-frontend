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

import { getHumanReadableError, walletOpenAsyncUnsafe } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import { ArrowDown as ArrowDownIcon, Plus as PlusIcon } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, ScrollView, StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import BoxSurface from '../components/layout/BoxSurface'
import Screen, { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '../components/layout/Screen'
import RadioButtonRow from '../components/RadioButtonRow'
import SpinnerModal from '../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import { useSortedWallets } from '../hooks/useSortedWallets'
import RootStackParamList from '../navigation/rootStackRoutes'
import { deriveWalletStoredAddresses, getStoredWalletById, rememberActiveWallet } from '../persistent-storage/wallets'
import { walletSwitched } from '../store/activeWalletSlice'
import { methodSelected, WalletGenerationMethod } from '../store/walletGenerationSlice'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import { resetNavigationState } from '../utils/navigation'

export interface SwitchWalletScreenProps extends StackScreenProps<RootStackParamList, 'SwitchWalletScreen'> {
  style?: StyleProp<ViewStyle>
}

const SwitchWalletScreen = ({ navigation, style }: SwitchWalletScreenProps) => {
  const dispatch = useAppDispatch()
  const wallets = useSortedWallets()
  const activeWalletMetadataId = useAppSelector((s) => s.activeWallet.metadataId)
  const pin = useAppSelector((s) => s.credentials.pin)

  const [loading, setLoading] = useState(false)

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleWalletItemPress = async (walletId: string) => {
    setLoading(true)

    try {
      const storedWallet = await getStoredWalletById(walletId)
      let mnemonic = storedWallet.mnemonic

      if (storedWallet.authType === 'pin') {
        if (pin) {
          const decryptedWallet = await walletOpenAsyncUnsafe(pin, storedWallet.mnemonic, pbkdf2, mnemonicToSeed)
          mnemonic = decryptedWallet.mnemonic
        } else {
          navigation.navigate('LoginScreen', { walletIdToLogin: walletId, workflow: 'wallet-switch' })
          return
        }
      }

      const wallet = { ...storedWallet, mnemonic }
      await rememberActiveWallet(wallet.metadataId)
      const addressesToInitialize = await deriveWalletStoredAddresses(wallet)
      dispatch(walletSwitched({ wallet, addressesToInitialize }))
      resetNavigationState()
    } catch (e) {
      Alert.alert(getHumanReadableError(e, 'Could not switch wallets'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen style={style}>
      <ScreenSection>
        <BottomModalScreenTitle>Wallets</BottomModalScreenTitle>
        <Subtitle>Switch to another wallet?</Subtitle>
      </ScreenSection>
      <ScrollView>
        <BoxSurface>
          {wallets.map((wallet, index) => (
            <RadioButtonRow
              key={wallet.id}
              title={wallet.name}
              onPress={() => handleWalletItemPress(wallet.id)}
              isActive={wallet.id === activeWalletMetadataId}
              isInput
            />
          ))}
        </BoxSurface>
      </ScrollView>
      <BottomScreenSection>
        <ButtonsRow>
          <Button title="New wallet" onPress={() => handleButtonPress('create')} Icon={PlusIcon} />
          <Button title="Import wallet" onPress={() => handleButtonPress('import')} Icon={ArrowDownIcon} />
        </ButtonsRow>
      </BottomScreenSection>
      <SpinnerModal isActive={loading} text="Switching wallets..." />
    </Screen>
  )
}

export default SwitchWalletScreen

const Subtitle = styled(AppText)`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
`
