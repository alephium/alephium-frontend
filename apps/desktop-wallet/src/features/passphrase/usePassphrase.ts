import { useCallback, useState } from 'react'

const usePassphrase = () => {
  const [passphrase, setPassphrase] = useState('')
  const [passphraseConsent, setPassphraseConsent] = useState(false)

  const isPassphraseSubmitEnabled = (passphraseConsent && !!passphrase) || (!passphraseConsent && !passphrase)

  const handleUsePassphrasePress = useCallback((consent: boolean) => {
    setPassphraseConsent(consent)
    setPassphrase('')
  }, [])

  return {
    passphrase,
    setPassphrase,
    isPassphraseSubmitEnabled,
    passphraseConsent,
    handleUsePassphrasePress
  }
}

export default usePassphrase
