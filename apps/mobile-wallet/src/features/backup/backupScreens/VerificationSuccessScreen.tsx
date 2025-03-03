import { useFocusEffect } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import CenteredInstructions from '~/components/text/CenteredInstructions'
import { useHeaderContext } from '~/contexts/HeaderContext'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { resetNavigation } from '~/utils/navigation'

interface VerificationSuccessScreenProps
  extends StackScreenProps<BackupMnemonicNavigationParamList, 'VerificationSuccessScreen'>,
    ScrollScreenProps {}

const VerificationSuccessScreen = ({ navigation, ...props }: VerificationSuccessScreenProps) => {
  const { setHeaderOptions } = useHeaderContext()
  const { t } = useTranslation()

  useFocusEffect(
    useCallback(() => {
      setHeaderOptions({
        headerLeft: () => null
      })
    }, [setHeaderOptions])
  )

  return (
    <ScrollScreen fill {...props}>
      <ScreenSection centered verticallyCentered style={{ marginTop: 100 }}>
        <AppText size={100}>👍</AppText>
      </ScreenSection>
      <ScreenSection fill>
        <CenteredInstructions
          instructions={[
            { text: t('Well done!'), type: 'primary' },
            { text: t('Enjoy your new (backed-up) wallet!'), type: 'secondary' }
          ]}
          stretch
          fontSize={19}
        />
      </ScreenSection>
      <ScreenSection>
        <Button
          variant="highlight"
          title={t('Return to my wallet')}
          onPress={() => resetNavigation(navigation.getParent())}
        />
      </ScreenSection>
    </ScrollScreen>
  )
}

export default VerificationSuccessScreen
