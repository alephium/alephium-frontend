import { NFT } from '@alephium/shared'

import useNftsGridFlashListProps from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'
import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'

interface NftGridModalProps {
  nftsData?: NFT[]
}

const NftGridModal = withModal<NftGridModalProps>(({ id, nftsData }) => {
  const flashListProps = useNftsGridFlashListProps({ nfts: nftsData })

  return <BottomModal2 modalId={id} flashListProps={flashListProps} />
})

export default NftGridModal
