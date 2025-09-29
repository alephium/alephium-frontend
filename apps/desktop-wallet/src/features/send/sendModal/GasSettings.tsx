import {
  formatAmountForDisplay,
  fromHumanReadableAmount,
  MINIMAL_GAS_AMOUNT,
  MINIMAL_GAS_PRICE
} from '@alephium/shared'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/Inputs/Input'
import useAnalytics from '@/features/analytics/useAnalytics'
import AlphAmountInfoBox from '@/features/send/sendModal/AlphAmountInfoBox'

export interface GasSettingsProps {
  gasAmount?: string
  gasAmountError: string
  gasPrice?: string
  gasPriceError: string
  onGasAmountChange: (v: string) => void
  onGasPriceChange: (v: string) => void
}

const GasSettings = ({
  gasAmount,
  gasAmountError,
  gasPrice,
  gasPriceError,
  onGasAmountChange,
  onGasPriceChange
}: GasSettingsProps) => {
  const { t } = useTranslation()
  const { sendAnalytics } = useAnalytics()

  const [expectedFee, setExpectedFee] = useState<bigint>()

  const minimalGasPriceInALPH = formatAmountForDisplay({ amount: MINIMAL_GAS_PRICE, fullPrecision: true })

  useEffect(() => {
    if (!gasAmount || !gasPrice) return

    try {
      setExpectedFee(BigInt(gasAmount) * fromHumanReadableAmount(gasPrice))
    } catch (error) {
      sendAnalytics({ type: 'error', error, message: 'Could not set expected fee' })
    }
  }, [gasAmount, gasPrice, sendAnalytics])

  return (
    <>
      <Input
        id="gas-amount"
        label={`${t('Gas amount')} (≥ ${MINIMAL_GAS_AMOUNT})`}
        value={gasAmount ?? ''}
        onChange={(e) => onGasAmountChange(e.target.value)}
        type="number"
        min={MINIMAL_GAS_AMOUNT}
        error={gasAmountError}
      />
      <Input
        id="gas-price"
        label={
          <>
            {t('Gas price')} (≥ {minimalGasPriceInALPH} ALPH)
          </>
        }
        value={gasPrice ?? ''}
        type="number"
        min={minimalGasPriceInALPH}
        onChange={(e) => onGasPriceChange(e.target.value)}
        step={minimalGasPriceInALPH}
        error={gasPriceError}
      />
      {expectedFee && <AlphAmountInfoBox label={t('Expected fee')} amount={expectedFee} short />}
    </>
  )
}

export default GasSettings
