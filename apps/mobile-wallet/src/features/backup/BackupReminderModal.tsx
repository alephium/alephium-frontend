import { NavigationProp, useNavigation } from '@react-navigation/native'
import { Trans, useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

export interface BackupReminderModalProps {
  isNewWallet: boolean
}

const BackupReminderModal = withModal<BackupReminderModalProps>(({ id, isNewWallet }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const handleValidatePress = () => {
    dispatch(closeModal({ id }))
    navigation.navigate('BackupMnemonicNavigation')
  }

  return (
    <BottomModal modalId={id} contentVerticalGap>
      <ScreenSection>
        <ModalScreenTitle>{isNewWallet ? `${t('Hello there!')} 👋` : `${t("Let's verify!")} 😌`}</ModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
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
      </ScreenSection>
      <ScreenSection>
        <Button title={t("Let's do that!")} onPress={handleValidatePress} variant="highlight" />
      </ScreenSection>
    </BottomModal>
  )
})

export default BackupReminderModal
