import { useFetchAddressNfts } from '@alephium/shared-react'
import { memo } from 'react'

import AddressBadge from '~/components/AddressBadge'
import useNftsGridFlashListProps from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'
import BottomModal2 from '~/features/modals/BottomModal2'

export interface AddressNftsGridModalProps {
  addressHash: string
}

const AddressNftsGridModal = memo<AddressNftsGridModalProps>(({ addressHash }) => {
  const { data: nfts } = useFetchAddressNfts(addressHash)
  const flashListProps = useNftsGridFlashListProps({ nfts })

  return <BottomModal2 title={<AddressBadge addressHash={addressHash} />} flashListProps={flashListProps} />
})

export default AddressNftsGridModal
