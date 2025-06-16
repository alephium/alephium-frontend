import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import Input from '~/components/inputs/Input'
import { ModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import useFundPassword from '~/features/fund-password/useFundPassword'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppSelector } from '~/hooks/redux'
import usePassword from '~/hooks/usePassword'

export interface FundPasswordModalProps {
  successCallback: () => void
}

const FundPasswordModal = memo<FundPasswordModalProps & ModalBaseProp>(({ id, successCallback }) => {
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)
  const fundPassword = useFundPassword()
  const { t } = useTranslation()
  const { password, handlePasswordChange, isPasswordCorrect, error } = usePassword({
    correctPassword: fundPassword ?? '',
    errorMessage: t('Provided fund password is wrong')
  })
  const { dismissModal } = useModalContext()

  const [displayedError, setDisplayedError] = useState<string | undefined>()

  if (!isUsingFundPassword || !fundPassword) return null

  const handleFundPasswordChange = (text: string) => {
    handlePasswordChange(text)
    setDisplayedError(undefined)
  }

  const handleSubmit = () => {
    if (isPasswordCorrect) {
      successCallback()
      dismissModal()
    } else {
      setDisplayedError(error)
    }
  }

  return (
    <BottomModal2 modalId={id} contentVerticalGap>
      <ScreenSection>
        <ModalScreenTitle>{t('Fund password')}</ModalScreenTitle>
      </ScreenSection>
      <ScreenSection>
        <AppText color="secondary" size={18}>
          {t('Please, enter your fund password.')}
        </AppText>
      </ScreenSection>
      <ScreenSection>
        <Input
          isInModal
          label={t('Fund password')}
          value={password}
          onChangeText={handleFundPasswordChange}
          onSubmitEditing={handleSubmit}
          secureTextEntry
          autoCapitalize="none"
          blurOnSubmit={false}
          error={displayedError}
        />
      </ScreenSection>
      <ScreenSection>
        <Button title={t('Submit')} variant="highlight" onPress={handleSubmit} disabled={password.length === 0} />
      </ScreenSection>
    </BottomModal2>
  )
})

export default FundPasswordModal
