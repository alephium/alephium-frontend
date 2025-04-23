import { newWalletInitialAddressGenerated } from '@alephium/shared'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenProps } from '~/components/layout/Screen'
import ScrollScreen from '~/components/layout/ScrollScreen'
import CenteredInstructions, { Instruction } from '~/components/text/CenteredInstructions'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import i18n from '~/features/localization/i18n'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { generateAndStoreWallet } from '~/persistent-storage/wallet'
import { newWalletGenerated } from '~/store/wallet/walletActions'
import { newWalletNameEntered } from '~/store/walletGenerationSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'
import { getInitialAddressSettings } from '~/utils/addresses'
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

  const handleButtonPress = async () => {
    if (!name) return

    if (method === 'import') {
      dispatch(newWalletNameEntered(name))
      navigation.navigate('SelectImportMethodScreen')
    } else if (method === 'create') {
      dispatch(activateAppLoading(t('Creating wallet')))

      try {
        await sleep(0) // Allow react state to update to display loader before heavy operation
        const wallet = await generateAndStoreWallet(name)

        dispatch(newWalletInitialAddressGenerated({ ...wallet.initialAddress, ...getInitialAddressSettings() }))
        dispatch(newWalletGenerated(wallet))

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
        dispatch(deactivateAppLoading())
      }
    }
  }

  return (
    <ScrollScreen
      fill
      contentPaddingTop
      hasKeyboard
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
