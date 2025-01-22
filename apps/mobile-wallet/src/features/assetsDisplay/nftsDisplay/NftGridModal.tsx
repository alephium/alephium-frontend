import { NFT } from '@alephium/shared'

import AddressBadge from '~/components/AddressBadge'
import NFTsGrid from '~/components/NFTsGrid'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'

interface NftGridModalProps {
  addressHash?: string
  nftsData?: NFT[]
}

const NftGridModal = withModal<NftGridModalProps>(({ id, addressHash, nftsData }) => (
  <BottomModalFlashList
    modalId={id}
    noPadding
    title={addressHash ? <AddressBadge addressHash={addressHash} /> : undefined}
    flashListRender={(props) => <NFTsGrid addressHash={addressHash} nfts={nftsData} {...props} />}
  />
))

export default NftGridModal
