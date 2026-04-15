import { AddressHash } from '@alephium/shared'
import Decimal from 'decimal.js'
import { useMemo } from 'react'

import useFetchXAlphBalance from './useFetchXAlphBalance'
import useFetchXAlphRate from './useFetchXAlphRate'

const useStakedValue = (addressHash: AddressHash) => {
  const { data: xAlphBalance, isLoading: isXAlphBalanceLoading } = useFetchXAlphBalance(addressHash)
  const { data: xAlphRate, isLoading: isXAlphRateLoading } = useFetchXAlphRate()

  const stakedValueAlph = useMemo(() => {
    const stakedValueDecimal = new Decimal(xAlphBalance.toString()).mul(xAlphRate)

    return BigInt(stakedValueDecimal.toDecimalPlaces(0, Decimal.ROUND_DOWN).toFixed(0))
  }, [xAlphBalance, xAlphRate])

  return {
    data: stakedValueAlph,
    isLoading: isXAlphBalanceLoading || isXAlphRateLoading
  }
}

export default useStakedValue
