import { memo } from 'react'
import { TouchableOpacity } from 'react-native'

import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'

const NFTThumbnail = (props: NFTImageProps) => {
  const dispatch = useAppDispatch()

  const openNftModal = () => dispatch(openModal({ name: 'NftModal', props: { nftId: props.nftId } }))

  return (
    <TouchableOpacity onPress={openNftModal}>
      <NFTImage {...props} />
    </TouchableOpacity>
  )
}

export default memo(NFTThumbnail)
