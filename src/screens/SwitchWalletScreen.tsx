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
import { useEffect, useState } from 'react'
import { Alert, ScrollView, StyleProp, ViewStyle } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '../components/AppText'
import Button from '../components/buttons/Button'
import ButtonsRow from '../components/buttons/ButtonsRow'
import Screen, { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '../components/layout/Screen'
import RadioButtonRow from '../components/RadioButtonRow'
import SpinnerModal from '../components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '../hooks/redux'
import RootStackParamList from '../navigation/rootStackRoutes'
import { getStoredWalletById, getWalletsMetadata, switchActiveWallet } from '../persistent-storage/wallets'
import { activeWalletSwitched } from '../store/activeWalletSlice'
import { methodSelected, WalletGenerationMethod } from '../store/walletGenerationSlice'
import { WalletMetadata } from '../types/wallet'
import { mnemonicToSeed, pbkdf2 } from '../utils/crypto'
import { useRestoreNavigationState } from '../utils/navigation'

export interface SwitchWalletScreenProps extends StackScreenProps<RootStackParamList, 'SwitchWalletScreen'> {
  style?: StyleProp<ViewStyle>
}

const SwitchWalletScreen = ({ navigation, style }: SwitchWalletScreenProps) => {
  const dispatch = useAppDispatch()
  const wallets = useSortedWallets()
  const theme = useTheme()
  const [activeWalletMetadataId, pin] = useAppSelector((s) => [s.activeWallet.metadataId, s.credentials.pin])
  const restoreNavigationState = useRestoreNavigationState()

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
          navigation.navigate('LoginScreen', { walletIdToLogin: walletId, resetWalletOnLogin: true })
          return
        }
      }

      const wallet = { ...storedWallet, mnemonic }

      const uninitializedWalletAddresses = await switchActiveWallet(wallet)
      dispatch(activeWalletSwitched({ wallet, addressesToInitialize: uninitializedWalletAddresses }))

      restoreNavigationState(true)
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
        <ScreenSection>
          {wallets.map((wallet, index) => (
            <RadioButtonRow
              key={wallet.id}
              title={wallet.name}
              onPress={() => handleWalletItemPress(wallet.id)}
              isFirst={index === 0}
              isLast={index === wallets.length - 1}
              isActive={wallet.id === activeWalletMetadataId}
              isInput
            />
          ))}
        </ScreenSection>
      </ScrollView>
      <BottomScreenSection>
        <ButtonsRow>
          <Button
            title="New wallet"
            onPress={() => handleButtonPress('create')}
            icon={<PlusIcon size={24} color={theme.font.contrast} />}
          />
          <Button
            title="Import wallet"
            onPress={() => handleButtonPress('import')}
            icon={<ArrowDownIcon size={24} color={theme.font.contrast} />}
          />
        </ButtonsRow>
      </BottomScreenSection>
      <SpinnerModal isActive={loading} text="Switching wallets..." />
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
  }, [activeWalletId])

  return sortedWallets
}

const Subtitle = styled(AppText)`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
`
