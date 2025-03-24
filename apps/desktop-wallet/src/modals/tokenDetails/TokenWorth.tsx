import { useFetchAddressWorth } from '@alephium/shared-react'
import { memo } from 'react'
import styled from 'styled-components'

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
  font-size: 38px;
`
