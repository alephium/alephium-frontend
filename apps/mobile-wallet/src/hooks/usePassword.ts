/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
