import { AddressHash } from '@alephium/shared'

import useFetchAddressWorth from '@/api/apiDataHooks/address/useFetchAddressWorth'
import Amount from '@/components/Amount'

interface AddressWorthProps {
  addressHash: AddressHash
}

const AddressWorth = ({ addressHash }: AddressWorthProps) => {
  const { data: worth, isLoading } = useFetchAddressWorth(addressHash)

  return <Amount value={worth} isFiat isLoading={isLoading} loaderHeight={18.5} semiBold />
}

export default AddressWorth
