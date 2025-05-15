import { useFetchAddressNfts } from '@alephium/shared-react'

import AddressBadge from '~/components/AddressBadge'
import NFTsGrid from '~/features/assetsDisplay/nftsDisplay/NFTsGrid'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'

export interface AddressNftsGridModalProps {
  addressHash: string
}

const AddressNftsGridModal = withModal<AddressNftsGridModalProps>(({ id, addressHash }) => {
  const { data: nfts } = useFetchAddressNfts(addressHash)

  return (
    <BottomModalFlashList
      modalId={id}
      noPadding
      title={<AddressBadge addressHash={addressHash} />}
      flashListRender={(props) => <NFTsGrid nfts={nfts} {...props} />}
    />
  )
})

export default AddressNftsGridModal
