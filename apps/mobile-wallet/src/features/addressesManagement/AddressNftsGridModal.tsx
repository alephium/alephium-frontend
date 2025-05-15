import { useFetchAddressNfts } from '@alephium/shared-react'

import AddressBadge from '~/components/AddressBadge'
import useNftsGridFlashListProps from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'
import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'

export interface AddressNftsGridModalProps {
  addressHash: string
}

const AddressNftsGridModal = withModal<AddressNftsGridModalProps>(({ id, addressHash }) => {
  const { data: nfts } = useFetchAddressNfts(addressHash)
  const flashListProps = useNftsGridFlashListProps({ nfts })

  return (
    <BottomModal2 modalId={id} title={<AddressBadge addressHash={addressHash} />} flashListProps={flashListProps} />
  )
})

export default AddressNftsGridModal
