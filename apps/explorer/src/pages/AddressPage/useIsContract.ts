import { contractIdFromAddress } from '@alephium/web3'
import { useEffect, useState } from 'react'

const useIsContract = (addressStr: string) => {
  const [isContract, setIsContract] = useState(false)

  useEffect(() => {
    try {
      setIsContract(!!contractIdFromAddress(addressStr))
    } catch (e) {
      setIsContract(false)
    }
  }, [addressStr])

  return isContract
}

export default useIsContract
