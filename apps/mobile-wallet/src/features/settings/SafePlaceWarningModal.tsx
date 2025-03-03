import { Trans, useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import BottomModal from '~/features/modals/BottomModal'
import { closeModal, openModal } from '~/features/modals/modalActions'
import { ModalContent } from '~/features/modals/ModalContent'
import withModal from '~/features/modals/withModal'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'

const SafePlaceWarningModal = withModal(({ id }) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()

  const openMnemonicModal = () => dispatch(openModal({ name: 'MnemonicModal' }))

  return (
    <BottomModal modalId={id} title={t('Warning')}>
      <ModalContent verticalGap>
        <ScreenSection>
          <ModalScreenTitle>{t('Be careful!')} 🕵️‍♀️</ModalScreenTitle>
        </ScreenSection>
        <ScreenSection>
          <AppText color="secondary" size={18}>
            {t("Don't share your secret recovery phrase with anyone!")}
          </AppText>
          <AppText color="secondary" size={18}>
            <Trans
              t={t}
              i18nKey="viewMnemonicModalWarning"
              components={{
                1: <AppText bold size={18} />
              }}
            >
              {'Before displaying it, make sure to be in an <1>non-public</1> space.'}
            </Trans>
          </AppText>
        </ScreenSection>
        <ScreenSection>
          <Button
            title={t('I understand')}
            variant="contrast"
            onPress={() => {
              dispatch(closeModal({ id }))

              triggerBiometricsAuthGuard({
                settingsToCheck: 'appAccessOrTransactions',
                successCallback: () =>
                  triggerFundPasswordAuthGuard({
                    successCallback: openMnemonicModal
                  })
              })
            }}
          />
        </ScreenSection>
      </ModalContent>
    </BottomModal>
  )
})

export default SafePlaceWarningModal
