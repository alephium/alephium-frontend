import { NFT } from '@alephium/shared'

import NFTsGrid from '~/components/NFTsGrid'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'

interface NftGridModalProps {
  nftsData?: NFT[]
}

const NftGridModal = withModal<NftGridModalProps>(({ id, nftsData }) => (
  <BottomModalFlashList modalId={id} noPadding flashListRender={(props) => <NFTsGrid nfts={nftsData} {...props} />} />
))

export default NftGridModal
