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

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import SpinnerModal from '~/components/SpinnerModal'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import i18n from '~/features/localization/i18n'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { generateAndStoreWallet } from '~/persistent-storage/wallet'
import { syncLatestTransactions } from '~/store/addressesSlice'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { newWalletNameEntered } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { showExceptionToast } from '~/utils/layout'
import { sleep } from '~/utils/misc'
import { resetNavigation } from '~/utils/navigation'

const instructions: Instruction[] = [
  { text: i18n.t("Alright, let's get to it."), type: 'secondary' },
  { text: i18n.t('How should we name this wallet?'), type: 'primary' }
]

interface NewWalletNameScreenProps
  extends NativeStackScreenProps<RootStackParamList, 'NewWalletNameScreen'>,
    ScreenProps {}

const NewWalletNameScreen = ({ navigation, ...props }: NewWalletNameScreenProps) => {
  const method = useAppSelector((s) => s.walletGeneration.method)
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const { deviceHasEnrolledBiometrics } = useBiometrics()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

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
        await sleep(0) // Allow react state to update to display loader before heavy operation
        const wallet = await generateAndStoreWallet(name)

        dispatch(newWalletGenerated(wallet))
        dispatch(syncLatestTransactions({ addresses: wallet.firstAddress.hash, areAddressesNew: true }))

        sendAnalytics({ event: 'Created new wallet' })
        resetNavigation(
          navigation,
          deviceHasEnrolledBiometrics && !biometricsRequiredForAppAccess
            ? 'AddBiometricsScreen'
            : 'NewWalletSuccessScreen'
        )
      } catch (error) {
        const message = 'Could not generate new wallet'

        showExceptionToast(error, t(message))
        sendAnalytics({ type: 'error', error, message, isSensitive: true })
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <ScrollScreen
      fill
      contentPaddingTop
      keyboardShouldPersistTaps="always"
      scrollEnabled={false}
      headerOptions={{
        type: 'stack'
      }}
      bottomButtonsRender={() => (
        <>
          <Button
            title={t('Continue')}
            type="primary"
            variant="contrast"
            disabled={!name}
            onPress={handleButtonPress}
          />
          <Button title={t('Cancel')} type="secondary" onPress={() => navigation.goBack()} />
        </>
      )}
      {...props}
    >
      <ContentContainer>
        <CenteredInstructions instructions={instructions} />
        <StyledInput
          label={t('Wallet name')}
          value={name}
          onChangeText={setName}
          autoFocus
          onSubmitEditing={() => !!name && handleButtonPress()}
          blurOnSubmit={false}
          maxLength={24}
          textAlign="center"
        />
      </ContentContainer>
      <SpinnerModal isActive={loading} text={`${t('Creating wallet')}...`} />
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
  width: 50%;
`
