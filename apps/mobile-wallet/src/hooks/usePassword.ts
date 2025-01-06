import { Dispatch, SetStateAction, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface UsePasswordProps {
  correctPassword: string
  errorMessage?: string
  isValidation?: boolean
}

interface UsePasswordReturn {
  password: string
  handlePasswordChange: (text: string) => void
  isPasswordCorrect: boolean
  setPassword: Dispatch<SetStateAction<string>>
  error?: string
}

const usePassword = ({ correctPassword, errorMessage, isValidation }: UsePasswordProps): UsePasswordReturn => {
  const { t } = useTranslation()

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()

  const isPasswordCorrect = !!password && !!correctPassword && password === correctPassword

  const handlePasswordChange = (text: string) => {
    setPassword(text)

    if (!isValidation || (error === undefined && text.length === correctPassword.length) || error !== undefined) {
      setError(text !== correctPassword ? errorMessage || t('Password is wrong') : '')
    }
  }

  return { password, handlePasswordChange, isPasswordCorrect, error, setPassword }
}

export default usePassword
