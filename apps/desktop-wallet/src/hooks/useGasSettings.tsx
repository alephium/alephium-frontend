import {
  formatAmountForDisplay,
  fromHumanReadableAmount,
  MINIMAL_GAS_AMOUNT,
  MINIMAL_GAS_PRICE
} from '@alephium/shared'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'

const useGasSettings = (initialGasAmount?: string, initialGasPrice?: string) => {
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()

  const [gasAmount, setGasAmount] = useState(initialGasAmount)
  const [gasPrice, setGasPrice] = useState(initialGasPrice)
  const [gasAmountError, setGasAmountError] = useState('')
  const [gasPriceError, setGasPriceError] = useState('')

  const clearGasSettings = () => {
    setGasAmount('')
    setGasPrice('')
    setGasPriceError('')
    setGasAmountError('')
  }

  const handleGasAmountChange = (newAmount: string) => {
    setGasAmount(newAmount)
    setGasAmountError(
      newAmount && parseInt(newAmount) < MINIMAL_GAS_AMOUNT
        ? t('Gas amount must be greater than {{ MINIMAL_GAS_AMOUNT }}.', { MINIMAL_GAS_AMOUNT })
        : ''
    )
  }

  const handleGasPriceChange = (newPrice: string) => {
    let newPriceNumber

    try {
      newPriceNumber = fromHumanReadableAmount(newPrice || '0')

      setGasPrice(newPrice)
      setGasPriceError(
        newPriceNumber && newPriceNumber < MINIMAL_GAS_PRICE
          ? t('Gas price must be greater than {{ amount }}', {
              amount: formatAmountForDisplay({ amount: MINIMAL_GAS_PRICE, fullPrecision: true })
            })
          : ''
      )
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Setting gas price' })
      return
    }
  }

  return {
    gasAmount,
    gasAmountError,
    gasPrice,
    gasPriceError,
    clearGasSettings,
    handleGasAmountChange,
    handleGasPriceChange
  }
}

export default useGasSettings
