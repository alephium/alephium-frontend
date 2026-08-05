import { AnalyticsEvent } from '@alephium/shared'
import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Button, { BackButton } from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useHeaderContext } from '~/contexts/HeaderContext'
import i18n from '~/features/localization/i18n'
import OrderedTable from '~/features/settings/OrderedTable'
import { useAppSelector } from '~/hooks/redux'
import usePreventScreenCapture from '~/hooks/usePreventScreenCapture'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { getIsWalletFunded, getWalletOrdinal } from '~/persistent-storage/wallet'
import { dangerouslyExportWalletMnemonic } from '~/persistent-storage/walletMnemonic'
import { showExceptionToast } from '~/utils/layout'

interface MnemonicScreenProps
  extends StackScreenProps<BackupMnemonicNavigationParamList, 'MnemonicScreen'>,
    ScrollScreenProps {}

const MnemonicScreen = ({ navigation, ...props }: MnemonicScreenProps) => {
  const { setHeaderOptions, screenScrollHandler } = useHeaderContext()
  const walletId = useAppSelector((s) => s.wallet.id)
  const { t } = useTranslation()

  const [mnemonicWords, setMnemonicWords] = useState<string[]>()

  usePreventScreenCapture()

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => <BackButton onPress={() => navigation.goBack()} />
      })
    }, [navigation, setHeaderOptions])
  )

  useEffect(() => {
    dangerouslyExportWalletMnemonic(walletId)
      .then((mnemonic) => {
        setMnemonicWords(mnemonic.split(' '))

        sendAnalytics({
          event: AnalyticsEvent.RECOVERY_PHRASE_SHOWN,
          props: {
            origin: 'backup',
            is_funded: getIsWalletFunded(walletId) ?? false,
            wallet_ordinal: getWalletOrdinal(walletId)
          }
        })
      })
      .catch((error) => {
        const message = 'Could not export mnemonic'

        showExceptionToast(error, i18n.t(message))
        sendAnalytics({ type: 'error', error, message, isSensitive: true })
      })
  }, [walletId])

  return (
    <ScrollScreen
      contentPaddingTop
      onScroll={screenScrollHandler}
      bottomButtonsRender={() => (
        <Button
          title={t('I wrote it down')}
          type="primary"
          variant="highlight"
          disabled={!mnemonicWords}
          // Replacing keeps the phrase off the back stack: it may only be reached through the auth
          // guard on BackupIntroScreen.
          onPress={() => navigation.replace('VerifyMnemonicScreen')}
        />
      )}
      {...props}
    >
      <ScreenSection centered>
        <OrderedTable items={mnemonicWords ?? []} />
      </ScreenSection>
      <ScreenSection>
        <CenteredInstructions
          instructions={[
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

export default MnemonicScreen
