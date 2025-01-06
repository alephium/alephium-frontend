import { memo } from 'react'

import useFetchAddressWorth from '@/api/apiDataHooks/address/useFetchAddressWorth'
import WorthOverview from '@/components/WorthOverview'

interface AddressWorthProps {
  addressHash: string
  overrideWorth?: number
}

const AddressWorth = memo(({ addressHash, ...props }: AddressWorthProps) => {
  const { data: worth, isLoading } = useFetchAddressWorth(addressHash)

  return <WorthOverview worth={worth} isLoading={isLoading} {...props} />
})

export default AddressWorth
