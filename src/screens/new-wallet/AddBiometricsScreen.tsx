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

import { walletGenerateAsyncUnsafe } from '@alephium/sdk'
import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useState } from 'react'
import { Text } from 'react-native'
import styled from 'styled-components/native'

import animationSrc from '../../animations/fingerprint.json'
import walletAnimationSrc from '../../animations/wallet.json'
import Button from '../../components/buttons/Button'
import ButtonStack from '../../components/buttons/ButtonStack'
import Screen from '../../components/layout/Screen'
import CenteredInstructions, { Instruction } from '../../components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '../../hooks/redux'
import useOnNewWalletSuccess from '../../hooks/useOnNewWalletSuccess'
import RootStackParamList from '../../navigation/rootStackRoutes'
import { walletStored } from '../../store/activeWalletSlice'
import { StoredWalletAuthType } from '../../types/wallet'
import { mnemonicToSeed } from '../../utils/crypto'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddBiometricsScreen'>

const instructions: Instruction[] = [
  { text: 'Do you want to activate biometric security? 👆', type: 'primary' },
  { text: 'Use fingerprint or face recognition instead of the passcode to unlock the wallet', type: 'secondary' }
]

const AddBiometricsScreen = ({ navigation }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const method = useAppSelector((state) => state.walletGeneration.method)
  const importedMnemonic = useAppSelector((state) => state.walletGeneration.importedMnemonic)
  const walletName = useAppSelector((state) => state.walletGeneration.walletName)
  const [loading, setLoading] = useState(false)

  const createAndStoreWallet = async (authType: StoredWalletAuthType) => {
    setLoading(true)

    if (method === 'create') {
      const wallet = await walletGenerateAsyncUnsafe(mnemonicToSeed)
      dispatch(
        walletStored({
          name: walletName,
          mnemonic: wallet.mnemonic,
          authType
        })
      )
    } else if (method === 'import' && importedMnemonic) {
      dispatch(
        walletStored({
          name: walletName,
          mnemonic: importedMnemonic,
          authType
        })
      )
    }
  }

  useOnNewWalletSuccess(() => {
    navigation.navigate('NewWalletSuccessPage')
  })

  console.log('AddBiometricsScreen renders')

  return (
    <Screen>
      <AnimationContainer>
        {loading ? (
          <>
            <StyledAnimation source={walletAnimationSrc} autoPlay speed={1.5} />
            <Text>Creating your wallet...</Text>
          </>
        ) : (
          <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
        )}
      </AnimationContainer>
      {!loading && (
        <>
          <CenteredInstructions instructions={instructions} stretch />
          <ActionsContainer>
            <ButtonStack>
              <Button title="Activate" type="primary" onPress={() => createAndStoreWallet('biometrics')} />
              <Button title="Later" type="secondary" onPress={() => createAndStoreWallet('pin')} />
            </ButtonStack>
          </ActionsContainer>
        </>
      )}
    </Screen>
  )
}

const AnimationContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const StyledAnimation = styled(LottieView)`
  width: 60%;
`

const ActionsContainer = styled.View`
  flex: 1.5;
  justify-content: center;
  align-items: center;
`

export default AddBiometricsScreen
