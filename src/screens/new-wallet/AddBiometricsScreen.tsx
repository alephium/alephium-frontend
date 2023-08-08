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
import LottieView from 'lottie-react-native'
import { useState } from 'react'
import styled from 'styled-components/native'

import animationSrc from '~/animations/fingerprint.json'
import Button from '~/components/buttons/Button'
import ButtonStack from '~/components/buttons/ButtonStack'
import Screen from '~/components/layout/Screen'
import SpinnerModal from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { enableBiometrics } from '~/persistent-storage/wallets'
import { biometricsEnabled } from '~/store/activeWalletSlice'

type ScreenProps = StackScreenProps<RootStackParamList, 'AddBiometricsScreen'>

const instructions: Instruction[] = [
  { text: 'Do you want to activate biometric security? 👆', type: 'primary' },
  { text: 'Use fingerprint or face recognition instead of the pin to unlock the wallet', type: 'secondary' }
]

const AddBiometricsScreen = ({ navigation, route: { params } }: ScreenProps) => {
  const activeWalletMetadataId = useAppSelector((s) => s.activeWallet.metadataId)
  const activeWalletMnemonic = useAppSelector((s) => s.activeWallet.mnemonic)
  const method = useAppSelector((s) => s.walletGeneration.method)
  const dispatch = useAppDispatch()

  const [loading, setLoading] = useState(false)

  const navigateToAddressDiscoveryPage = () => navigation.navigate('ImportWalletAddressDiscoveryScreen')

  const activateBiometrics = async () => {
    setLoading(true)

    await enableBiometrics(activeWalletMetadataId, activeWalletMnemonic)
    dispatch(biometricsEnabled())

    if (params?.skipAddressDiscovery) {
      navigation.navigate('NewWalletSuccessPage')
    } else {
      navigateToAddressDiscoveryPage()
    }

    setLoading(false)
  }

  return (
    <Screen>
      <AnimationContainer>
        <StyledAnimation source={animationSrc} autoPlay speed={1.5} />
      </AnimationContainer>
      <CenteredInstructions instructions={instructions} stretch />
      <ActionsContainer>
        <ButtonStack>
          <Button title="Activate" type="primary" onPress={activateBiometrics} />
          <Button
            title="Later"
            type="secondary"
            onPress={() =>
              navigation.navigate(
                method === 'import' && !params?.skipAddressDiscovery
                  ? 'ImportWalletAddressDiscoveryScreen'
                  : 'NewWalletSuccessPage'
              )
            }
          />
        </ButtonStack>
      </ActionsContainer>
      <SpinnerModal isActive={loading} text="Enabling biometrics..." />
    </Screen>
  )
}

export default AddBiometricsScreen

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
