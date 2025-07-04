import { NavigationProp, useNavigation } from '@react-navigation/native'
import { memo } from 'react'
import { Trans, useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import { ModalScreenTitle } from '~/components/layout/Screen'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import RootStackParamList from '~/navigation/rootStackRoutes'

export interface BackupReminderModalProps {
  isNewWallet: boolean
}

const BackupReminderModal = memo<BackupReminderModalProps>(({ isNewWallet }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { t } = useTranslation()
  const { dismissModal } = useModalContext()

  const handleValidatePress = () => {
    dismissModal()
    navigation.navigate('BackupMnemonicNavigation')
  }

  return (
    <BottomModal2 contentVerticalGap>
      <ModalScreenTitle>{isNewWallet ? `${t('Hello there!')} 👋` : `${t("Let's verify!")} 😌`}</ModalScreenTitle>
      {isNewWallet ? (
        <AppText color="secondary" size={18}>
          <Trans
            t={t}
            i18nKey="backupModalMessage1"
            components={{
              1: <AppText size={18} bold />
            }}
          >
            {
              'The first and most important step is to <1>write down your secret recovery phrase</1> and store it in a safe place.'
            }
          </Trans>
        </AppText>
      ) : (
        <AppText color="secondary" size={18}>
          <Trans
            t={t}
            i18nKey="backupModalMessage2"
            components={{
              1: <AppText size={18} bold />
            }}
          >
            {'Have peace of mind by verifying that you <1>wrote your secret recovery phrase down</1> correctly.'}
          </Trans>
        </AppText>
      )}
      <BottomButtons fullWidth>
        <Button title={t("Let's do that!")} onPress={handleValidatePress} variant="highlight" />
      </BottomButtons>
    </BottomModal2>
  )
})

export default BackupReminderModal
