import { AnalyticsEvent } from '@alephium/shared'
import { memo } from 'react'
import { TouchableOpacity } from 'react-native'

import { sendAnalytics } from '~/analytics'
import NFTImage, { NFTImageProps } from '~/components/NFTImage'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'

const NFTThumbnail = (props: NFTImageProps) => {
  const dispatch = useAppDispatch()

  const openNftModal = () => {
    dispatch(openModal({ name: 'NftModal', props: { nftId: props.nftId } }))
    sendAnalytics({ event: AnalyticsEvent.NFT_DETAILS_OPENED })
  }

  return (
    <TouchableOpacity onPress={openNftModal}>
      <NFTImage {...props} />
    </TouchableOpacity>
  )
}

export default memo(NFTThumbnail)
