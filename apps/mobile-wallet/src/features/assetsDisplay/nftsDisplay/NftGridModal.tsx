import { NFT } from '@alephium/shared'
import { memo } from 'react'

import useNftsGridFlashListProps from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'
import BottomModal, { DEFAULT_SNAP_POINTS } from '~/features/modals/BottomModal'

interface NftGridModalProps {
  nftsData?: NFT[]
}

const NftGridModal = memo<NftGridModalProps>(({ nftsData }) => {
  const flashListProps = useNftsGridFlashListProps({ nfts: nftsData })

  return (
    <BottomModal
      flashListProps={flashListProps}
      bottomSheetModalProps={{ enableDynamicSizing: false, snapPoints: DEFAULT_SNAP_POINTS }}
    />
  )
})

export default NftGridModal
