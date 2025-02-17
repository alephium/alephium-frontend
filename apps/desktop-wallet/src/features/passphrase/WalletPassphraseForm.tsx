import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Input from '@/components/Inputs/Input'

interface WalletPassphraseFormProps {
  onPassphraseConfirmed: (passphrase: string) => void
  className?: string
}

const WalletPassphraseForm = ({ onPassphraseConfirmed, className }: WalletPassphraseFormProps) => {
  const { t } = useTranslation()
  const [value, setValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')

  const passphraseIsNotUsed = !value && !confirmValue
  const showConfirmError = confirmValue.length >= value.length && value !== confirmValue

  useEffect(() => {
    const isPassphraseConfirmed = value === confirmValue || passphraseIsNotUsed
    onPassphraseConfirmed(isPassphraseConfirmed ? confirmValue : '')
  }, [onPassphraseConfirmed, confirmValue, value, passphraseIsNotUsed])

  useEffect(() => {
    if (!value && !!confirmValue) setConfirmValue('')
  }, [confirmValue, value])

  return (
    <Container className={className}>
      <Input
        id="optional-passphrase"
        value={value}
        label={t('Optional passphrase')}
        type="password"
        onChange={(e) => setValue(e.target.value)}
      />
      <Input
        id="optional-passphrase-confirm"
        value={confirmValue}
        label={t('Confirm passphrase')}
        type="password"
        onChange={(e) => setConfirmValue(e.target.value)}
        error={showConfirmError && t("Passphrases don't match")}
      />
    </Container>
  )
}

export default WalletPassphraseForm

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
`
