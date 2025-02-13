import { memo } from 'react'
import styled from 'styled-components'

import useFetchAddressWorth from '@/api/apiDataHooks/address/useFetchAddressWorth'
import WorthOverview from '@/components/WorthOverview'

interface AddressWorthProps {
  addressHash: string
}

const AddressWorth = memo(({ addressHash, ...props }: AddressWorthProps) => {
  const { data: worth, isLoading } = useFetchAddressWorth(addressHash)

  return <AddressWorthStyled worth={worth} isLoading={isLoading} {...props} />
})

export default AddressWorth

const AddressWorthStyled = styled(WorthOverview)`
  font-size: 34px;
`
