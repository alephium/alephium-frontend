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
import { useState } from 'react'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { ContinueButton } from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { generateAndStoreWallet } from '~/persistent-storage/wallet'
import { syncLatestTransactions } from '~/store/addressesSlice'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { newWalletNameEntered } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

const instructions: Instruction[] = [
  { text: "Alright, let's get to it.", type: 'secondary' },
  { text: 'How should we call this wallet?', type: 'primary' }
]

interface NewWalletNameScreenProps extends StackScreenProps<RootStackParamList, 'NewWalletNameScreen'>, ScreenProps {}

const NewWalletNameScreen = ({ navigation, ...props }: NewWalletNameScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const { deviceHasEnrolledBiometrics } = useBiometrics()
  const dispatch = useAppDispatch()

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleButtonPress = async () => {
    if (!name) return

    if (method === 'import') {
      dispatch(newWalletNameEntered(name))
      navigation.navigate('SelectImportMethodScreen')
    } else if (method === 'create') {
      setLoading(true)

      try {
        const wallet = await generateAndStoreWallet(name)

        dispatch(newWalletGenerated(wallet))
        dispatch(syncLatestTransactions(wallet.firstAddress.hash))

        sendAnalytics('Created new wallet')
        resetNavigation(navigation, deviceHasEnrolledBiometrics ? 'AddBiometricsScreen' : 'NewWalletSuccessScreen')
      } catch (e) {
        showExceptionToast(e, 'Could not generate new wallet')
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <ScrollScreen
      usesKeyboard
      fill
      headerOptions={{
        type: 'stack',
        headerRight: () => <ContinueButton onPress={handleButtonPress} disabled={name.length < 3} />
      }}
      keyboardShouldPersistTaps="always"
      {...props}
    >
      <ContentContainer>
        <CenteredInstructions instructions={instructions} />
        <StyledInput
          label="Wallet name"
          value={name}
          onChangeText={setName}
          autoFocus
          onSubmitEditing={handleButtonPress}
          blurOnSubmit={false}
          returnKeyType="done"
          maxLength={24}
        />
      </ContentContainer>
      <SpinnerModal isActive={loading} text="Creating wallet..." />
    </ScrollScreen>
  )
}

export default NewWalletNameScreen

const ContentContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  margin-bottom: 75%;
`

const StyledInput = styled(Input)`
  margin-top: ${DEFAULT_MARGIN}px;
  width: 80%;
`
