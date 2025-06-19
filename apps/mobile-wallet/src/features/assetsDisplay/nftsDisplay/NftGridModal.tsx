import { NFT } from '@alephium/shared'
import { memo } from 'react'

import useNftsGridFlashListProps from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'
import BottomModal2 from '~/features/modals/BottomModal2'

interface NftGridModalProps {
  nftsData?: NFT[]
}

const NftGridModal = memo<NftGridModalProps>(({ nftsData }) => {
  const flashListProps = useNftsGridFlashListProps({ nfts: nftsData })

  return <BottomModal2 flashListProps={flashListProps} />
})

export default NftGridModal
