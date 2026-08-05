import { AnalyticsEvent } from '@alephium/shared'
import { useFocusEffect, usePreventRemove } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert } from 'react-native'
import styled from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import backupAnimationSrc from '~/animations/lottie/backup.json'
import Button, { BackButton } from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useHeaderContext } from '~/contexts/HeaderContext'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { useAppSelector } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { getIsWalletFunded, getWalletOrdinal } from '~/persistent-storage/wallet'

interface BackupIntroScreenProps
  extends StackScreenProps<BackupMnemonicNavigationParamList, 'BackupIntroScreen'>,
    ScrollScreenProps {}

const BackupIntroScreen = ({ navigation, ...props }: BackupIntroScreenProps) => {
  const { setHeaderOptions, screenScrollHandler } = useHeaderContext()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const walletId = useAppSelector((s) => s.wallet.id)
  const { t } = useTranslation()

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
      })
    }, [navigation, setHeaderOptions])
  )

  useEffect(() => {
    sendAnalytics({
      event: AnalyticsEvent.BACKUP_INTRO_SHOWN,
      props: { is_funded: getIsWalletFunded(walletId) ?? false, wallet_ordinal: getWalletOrdinal(walletId) }
    })
  }, [walletId])

  // The root screen of the flow, so it is the only one whose removal means the user is abandoning the
  // backup rather than stepping back inside it.
  usePreventRemove(!isMnemonicBackedUp, ({ data }) => {
    Alert.alert(t('Leave the backup for now?'), undefined, [
      {
        text: t('Remind me later'),
        style: 'cancel',
        onPress: () => {
          sendAnalytics({ event: AnalyticsEvent.BACKUP_EXIT_PROMPT_ANSWERED, props: { outcome: 'left' } })
          navigation.dispatch(data.action)
        }
      },
      {
        text: t('Continue backing up'),
        // Without it iOS emphasises the `cancel` button, which here is the one that leaves.
        isPreferred: true,
        onPress: () =>
          sendAnalytics({ event: AnalyticsEvent.BACKUP_EXIT_PROMPT_ANSWERED, props: { outcome: 'continued' } })
      }
    ])
  })

  const onShowSecretRecoveryPhraseButtonPress = () => {
    triggerBiometricsAuthGuard({
      settingsToCheck: 'appAccessOrTransactions',
      successCallback: () =>
        triggerFundPasswordAuthGuard({
          successCallback: () => navigation.navigate('MnemonicScreen')
        }),
      failureCallback: (reason) =>
        sendAnalytics({ event: AnalyticsEvent.RECOVERY_PHRASE_AUTH_FAILED, props: { origin: 'backup', reason } })
    })
  }

  return (
    <ScrollScreen
      fill
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('Show secret recovery phrase')}
          iconProps={{ name: 'key-outline' }}
          type="primary"
          variant="highlight"
          onPress={onShowSecretRecoveryPhraseButtonPress}
        />
      )}
      {...props}
    >
      <ScreenSection fill centered verticallyCentered>
        <StyledAnimation source={backupAnimationSrc} autoPlay />
      </ScreenSection>
      <ScreenSection fill>
        <CenteredInstructions
          instructions={[
            {
              text: t('In the following screens you will see and verify your secret recovery phrase.'),
              type: 'secondary'
            },
            { text: t('Write it down and store it in a safe place.'), type: 'primary' },
            {
              text: t('Why is this important?'),
              type: 'link',
              url: 'https://docs.alephium.org/frequently-asked-questions#why-is-it-important-to-back-up-your-secret-recovery-phrase'
            }
          ]}
        />
      </ScreenSection>
    </ScrollScreen>
  )
}

export default BackupIntroScreen

const StyledAnimation = styled(LottieView)`
  width: 100%;
  height: 200px;
`
