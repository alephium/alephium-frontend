import { walletUnlockedMobile } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import DeprecatedAuthenticationModal from '~/components/DeprecatedAuthenticationModal'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import { Spinner } from '~/features/loader/SpinnerModal'
import { allBiometricsEnabled } from '~/features/settings/settingsActions'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useBiometrics } from '~/hooks/useBiometrics'
import RootStackParamList from '~/navigation/rootStackRoutes'
import {
  getStoredWalletMetadata,
  isStoredWalletMetadataMigrated,
  migrateDeprecatedMnemonic
} from '~/persistent-storage/wallet'
import { mnemonicMigrated } from '~/store/wallet/walletActions'
import { showExceptionToast } from '~/utils/layout'
import { resetNavigation } from '~/utils/navigation'

interface LoginWithPinScreenProps extends StackScreenProps<RootStackParamList, 'LoginWithPinScreen'>, ScreenProps {}

const LoginWithPinScreen = ({ navigation, ...props }: LoginWithPinScreenProps) => {
  const dispatch = useAppDispatch()
  const biometricsRequiredForAppAccess = useAppSelector((s) => s.settings.usesBiometrics)
  const { deviceSupportsBiometrics, deviceHasEnrolledBiometrics } = useBiometrics()
  const { t } = useTranslation()

  const [isPinModalVisible, setIsPinModalVisible] = useState(true)

  const handleSuccessfulLogin = useCallback(
    async (deprecatedMnemonic?: string) => {
      if (!deprecatedMnemonic) return

      setIsPinModalVisible(false)

      try {
        await migrateDeprecatedMnemonic(deprecatedMnemonic)
        dispatch(mnemonicMigrated())

        if (deviceSupportsBiometrics && deviceHasEnrolledBiometrics && !biometricsRequiredForAppAccess) {
          dispatch(allBiometricsEnabled())
        }

        const wallet = await getStoredWalletMetadata()

        if (!isStoredWalletMetadataMigrated(wallet)) throw new Error('Wallet metadata is not migrated')

        dispatch(walletUnlockedMobile(wallet))
        resetNavigation(navigation)
        sendAnalytics({
          event: 'Unlocked wallet',
          props: {
            wallet_name_length: wallet.name.length,
            number_of_addresses: wallet.addresses.length,
            number_of_contacts: wallet.contacts.length
          }
        })
      } catch (error) {
        const message = 'Could not migrate mnemonic and unlock wallet'

        showExceptionToast(error, t(message))
        sendAnalytics({ type: 'error', message })
      }
    },
    [biometricsRequiredForAppAccess, deviceHasEnrolledBiometrics, deviceSupportsBiometrics, dispatch, navigation, t]
  )

  return (
    <Screen {...props}>
      <DeprecatedAuthenticationModal visible={isPinModalVisible} forcePinUsage onConfirm={handleSuccessfulLogin} />
      {!isPinModalVisible && <Spinner text={`${t('Unlocking')}...`} />}
    </Screen>
  )
}

export default LoginWithPinScreen
