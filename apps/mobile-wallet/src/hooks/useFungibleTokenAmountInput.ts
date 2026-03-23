import { fromHumanReadableAmount, getNumberOfDecimals, toHumanReadableAmount } from '@alephium/shared'
import { MIN_UTXO_SET_AMOUNT, prettifyTokenAmount } from '@alephium/web3'
import { RefObject, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TextInput } from 'react-native-gesture-handler'

import { isNumericStringValid } from '~/utils/numbers'

export type UseFungibleTokenAmountInputOptions = {
  maxBalance: bigint
  decimals: number
  initialAmount?: string
  /** When `tokenId` is ALPH and this is true, block amounts below the minimum UTXO set size (send flow). */
  enforceMinAlphTransfer?: boolean
  /** Sync `Input` from react-native-gesture-handler when using Max + defaultValue. */
  nativeInputRef?: RefObject<TextInput | null>
}

const useFungibleTokenAmountInput = ({
  maxBalance,
  decimals,
  initialAmount = '',
  enforceMinAlphTransfer = false,
  nativeInputRef
}: UseFungibleTokenAmountInputOptions) => {
  const { t } = useTranslation()
  const [amount, setAmount] = useState(initialAmount)
  const [error, setError] = useState('')

  const maxHumanReadable = useMemo(() => toHumanReadableAmount(maxBalance, decimals), [maxBalance, decimals])
  const formattedMaxBalance = useMemo(() => prettifyTokenAmount(maxBalance, decimals) || '0', [maxBalance, decimals])

  const amountParsed = useMemo(() => {
    if (!amount || error) return undefined

    try {
      return fromHumanReadableAmount(amount, decimals)
    } catch {
      return undefined
    }
  }, [amount, error, decimals])

  const handleAmountChange = useCallback(
    (value: string) => {
      let cleanedAmount = value.replace(',', '.')
      cleanedAmount = isNumericStringValid(cleanedAmount, true) ? cleanedAmount : ''

      const tooManyDecimals = getNumberOfDecimals(cleanedAmount) > decimals
      let parsedAmount: bigint | undefined

      if (cleanedAmount && !tooManyDecimals) {
        try {
          parsedAmount = fromHumanReadableAmount(cleanedAmount, decimals)
        } catch {
          parsedAmount = undefined
        }
      }

      const exceedsMax = parsedAmount !== undefined && parsedAmount > maxBalance
      const belowAlphMin =
        enforceMinAlphTransfer &&
        parsedAmount !== undefined &&
        parsedAmount > BigInt(0) &&
        parsedAmount < MIN_UTXO_SET_AMOUNT

      let nextError = ''
      if (exceedsMax) {
        nextError = t('Amount exceeds available balance')
      } else if (belowAlphMin) {
        nextError = t('Amount must be greater than {{ minAmount }}', {
          minAmount: toHumanReadableAmount(MIN_UTXO_SET_AMOUNT)
        })
      } else if (tooManyDecimals) {
        nextError = t('This asset cannot have more than {{ numberOfDecimals }} decimals', {
          numberOfDecimals: decimals
        })
      }

      setError(nextError)
      setAmount(cleanedAmount)
    },
    [decimals, enforceMinAlphTransfer, maxBalance, t]
  )

  const handleMax = useCallback(() => {
    setAmount(maxHumanReadable)
    setError('')
    nativeInputRef?.current?.setNativeProps({ text: maxHumanReadable })
  }, [maxHumanReadable, nativeInputRef])

  const handleClear = useCallback(() => {
    setAmount('')
    setError('')
  }, [])

  return {
    amount,
    setAmount,
    error,
    amountParsed,
    formattedMaxBalance,
    handleAmountChange,
    handleMax,
    handleClear
  }
}

export default useFungibleTokenAmountInput
