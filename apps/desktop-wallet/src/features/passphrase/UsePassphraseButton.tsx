import { Lock, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import Button, { ButtonProps } from '@/components/Button'
import { openModal } from '@/features/modals/modalActions'
import { WalletPassphraseDisclaimerModalProps } from '@/features/passphrase/WalletPassphraseDisclaimerModal'
import { useAppDispatch } from '@/hooks/redux'

interface UsePassphraseButtonProps extends ButtonProps, Pick<WalletPassphraseDisclaimerModalProps, 'onConsentChange'> {
  passphraseConsent: boolean
}

const UsePassphraseButton = ({ passphraseConsent, onConsentChange, ...props }: UsePassphraseButtonProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const onUsePassphraseClick = () =>
    passphraseConsent
      ? onConsentChange(false)
      : dispatch(openModal({ name: 'WalletPassphraseDisclaimerModal', props: { onConsentChange } }))

  return (
    <Button onClick={onUsePassphraseClick} Icon={passphraseConsent ? X : Lock} role="secondary" short {...props}>
      {t(passphraseConsent ? "Don't use passphrase" : 'Use optional passphrase')}
    </Button>
  )
}

export default UsePassphraseButton
