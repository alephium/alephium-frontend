import { customNetworkSettingsSaved, NetworkSettings } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { persistSettings } from '~/features/settings/settingsPersistentStorage'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { showExceptionToast } from '~/utils/layout'

interface CustomNetworkScreenProps
  extends StackScreenProps<RootStackParamList, 'CustomNetworkScreen'>,
    ScrollScreenProps {}

const CustomNetworkScreen = ({ navigation }: CustomNetworkScreenProps) => {
  const currentNetworkSettings = useAppSelector((s) => s.network.settings)
  const { control, handleSubmit } = useForm<NetworkSettings>({
    defaultValues: currentNetworkSettings
  })
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const saveCustomNetwork = async (formData: NetworkSettings) => {
    dispatch(activateAppLoading(t('Saving')))

    try {
      await persistSettings('network', formData)
      dispatch(customNetworkSettingsSaved(formData))

      sendAnalytics({ event: 'Saved custom network settings' })
    } catch (error) {
      const message = 'Could not save custom network settings'

      showExceptionToast(error, t(message))
      sendAnalytics({ type: 'error', error, message })
    }

    dispatch(deactivateAppLoading())

    navigation.goBack()
  }

  return (
    <ScrollScreen
      fill
      contentPaddingTop
      headerOptions={{ type: 'stack', headerTitle: t('Custom network') }}
      bottomButtonsRender={() => (
        <Button title={t('Save')} variant="highlight" onPress={handleSubmit(saveCustomNetwork)} />
      )}
    >
      <ScreenSection verticalGap>
        <Controller
          name="nodeHost"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Node host')}
              keyboardType="url"
              textContentType="URL"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
          control={control}
        />
        <Controller
          name="explorerApiHost"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Explorer API host')}
              keyboardType="url"
              textContentType="URL"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
          control={control}
        />
        <Controller
          name="explorerUrl"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label={t('Explorer URL')}
              keyboardType="url"
              textContentType="URL"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
          control={control}
        />
      </ScreenSection>
    </ScrollScreen>
  )
}

export default CustomNetworkScreen
