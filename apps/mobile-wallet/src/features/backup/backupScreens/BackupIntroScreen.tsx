import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import LottieView from 'lottie-react-native'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import backupAnimationSrc from '~/animations/lottie/backup.json'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button, { BackButton } from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useHeaderContext } from '~/contexts/HeaderContext'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

interface BackupIntroScreenProps
  extends StackScreenProps<SendNavigationParamList, 'BackupIntroScreen'>,
    ScrollScreenProps {}

const BackupIntroScreen = ({ navigation, ...props }: BackupIntroScreenProps) => {
  const { setHeaderOptions, screenScrollHandler } = useHeaderContext()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
      })
    }, [navigation, setHeaderOptions])
  )

  const openMnemonicModal = () =>
    dispatch(
      openModal({ name: 'MnemonicModal', props: { onVerifyPress: () => navigation.navigate('VerifyMnemonicScreen') } })
    )

  const onShowSecretRecoveryPhraseButtonPress = () => {
    triggerBiometricsAuthGuard({
      settingsToCheck: 'appAccessOrTransactions',
      successCallback: () =>
        triggerFundPasswordAuthGuard({
          successCallback: openMnemonicModal
        })
    })
  }

  return (
    <ScrollScreen fill onScroll={screenScrollHandler} {...props}>
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
      <BottomButtons>
        <Button
          title={t('Show secret recovery phrase')}
          iconProps={{ name: 'key' }}
          type="primary"
          variant="highlight"
          onPress={onShowSecretRecoveryPhraseButtonPress}
        />
      </BottomButtons>
    </ScrollScreen>
  )
}

export default BackupIntroScreen

const StyledAnimation = styled(LottieView)`
  width: 100%;
  height: 50%;
`
