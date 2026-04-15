import Decimal from 'decimal.js'
import { useMemo } from 'react'

import useFetchXAlphTokenState from './useFetchXAlphTokenState'

const useFetchXAlphRate = () => {
  const { data: tokenState, isLoading } = useFetchXAlphTokenState()

  const xAlphRate = useMemo(() => {
    const totalXAlphSupply = tokenState?.fields.totalXAlphSupply

    if (!totalXAlphSupply) return new Decimal(1)

    const totalDepositedAlph = tokenState.fields.totalDepositedAlph

    if (!totalDepositedAlph) return new Decimal(0)

    return new Decimal(totalDepositedAlph.toString()).div(totalXAlphSupply.toString())
  }, [tokenState])

  return {
    data: xAlphRate,
    isLoading
  }
}

export default useFetchXAlphRate
