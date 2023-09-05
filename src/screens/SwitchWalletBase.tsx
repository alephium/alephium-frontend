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
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { usePostHog } from 'posthog-react-native'
import { useState } from 'react'
import { Alert, ScrollView } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import ButtonsRow from '~/components/buttons/ButtonsRow'
import BoxSurface from '~/components/layout/BoxSurface'
import { BottomModalScreenTitle, BottomScreenSection, ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import SpinnerModal from '~/components/SpinnerModal'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useSortedWallets } from '~/hooks/useSortedWallets'
import RootStackParamList from '~/navigation/rootStackRoutes'
import {
  deriveWalletStoredAddresses,
  getActiveWalletMetadata,
  getStoredWalletById,
  rememberActiveWallet
} from '~/persistent-storage/wallets'
import { walletSwitched } from '~/store/activeWalletSlice'
import { methodSelected, WalletGenerationMethod } from '~/store/walletGenerationSlice'
import { mnemonicToSeed, pbkdf2 } from '~/utils/crypto'
import { resetNavigationState } from '~/utils/navigation'

interface SwitchWalletBaseProps {
  onClose?: () => void
}

const SwitchWalletBase = ({ onClose }: SwitchWalletBaseProps) => {
  const dispatch = useAppDispatch()
  const wallets = useSortedWallets()
  const activeWalletMetadataId = useAppSelector((s) => s.activeWallet.metadataId)
  const pin = useAppSelector((s) => s.credentials.pin)
  const posthog = usePostHog()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  const [loading, setLoading] = useState(false)

  const handleButtonPress = (method: WalletGenerationMethod) => {
    dispatch(methodSelected(method))
    onClose && onClose()
    navigation.navigate('NewWalletIntroScreen')
  }

  const handleWalletItemPress = async (walletId: string) => {
    setLoading(true)
    onClose && onClose()

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
      const activeWalletMetadata = await getActiveWalletMetadata()

      dispatch(walletSwitched({ wallet, addressesToInitialize, contacts: activeWalletMetadata?.contacts ?? [] }))
      resetNavigationState()

      posthog?.capture('Switched wallet')
    } catch (e) {
      Alert.alert(getHumanReadableError(e, 'Could not switch wallets'))

      posthog?.capture('Error', { message: 'Could not switch wallets' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Content>
        <BottomModalScreenTitle>Wallets</BottomModalScreenTitle>
        <Subtitle>Switch to another wallet?</Subtitle>

        <ScrollView alwaysBounceVertical={false}>
          <ScreenSection>
            <BoxSurface>
              {wallets.map((wallet) => (
                <RadioButtonRow
                  key={wallet.id}
                  title={wallet.name}
                  onPress={() => handleWalletItemPress(wallet.id)}
                  isActive={wallet.id === activeWalletMetadataId}
                  isInput
                />
              ))}
            </BoxSurface>
          </ScreenSection>
        </ScrollView>
      </Content>

      <BottomScreenSection>
        <ButtonsRow>
          <Button title="New wallet" onPress={() => handleButtonPress('create')} iconProps={{ name: 'add-outline' }} />
          <Button
            title="Import wallet"
            onPress={() => handleButtonPress('import')}
            iconProps={{ name: 'arrow-down-outline' }}
          />
        </ButtonsRow>
      </BottomScreenSection>
      <SpinnerModal isActive={loading} text="Switching wallets..." />
    </>
  )
}

export default SwitchWalletBase

const Subtitle = styled(AppText)`
  font-weight: 500;
  font-size: 16px;
  color: ${({ theme }) => theme.font.secondary};
`

const Content = styled.View``
