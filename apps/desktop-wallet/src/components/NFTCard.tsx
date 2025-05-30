import { isNFT, NFT } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { colord } from 'colord'
import { motion, useInView } from 'framer-motion'
import { memo, useRef } from 'react'
import styled from 'styled-components'

import Ellipsed from '@/components/Ellipsed'
import SkeletonLoader from '@/components/SkeletonLoader'
import Truncate from '@/components/Truncate'
import { openModal } from '@/features/modals/modalActions'
import NFTThumbnail from '@/features/thumbnails/NFTThumbnail'
import { useAppDispatch } from '@/hooks/redux'

interface NFTCardProps {
  nftId: NFT['id']
}

const NFTCard = memo(({ nftId }: NFTCardProps) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const dispatch = useAppDispatch()

  const openNFTDetailsModal = () => dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId } }))

  return (
    <NFTCardStyled onClick={openNFTDetailsModal} ref={ref}>
      {isInView && <NftCardContent nftId={nftId} />}
    </NFTCardStyled>
  )
})

export default NFTCard

const NftCardContent = ({ nftId }: NFTCardProps) => {
  const { data: token, isLoading } = useFetchToken(nftId)

  if (!token || !isNFT(token)) return null

  return (
    <CardContent>
      <NFTPictureContainer>
        <NFTThumbnail nftId={nftId} size="100%" playOnHover showPlayIconIfVideo />
      </NFTPictureContainer>

      <NFTNameContainer>
        {isLoading ? (
          <SkeletonLoader height="15px" />
        ) : token.name ? (
          <NFTName>{token.name}</NFTName>
        ) : (
          <EllipsedStyled text={token.id} />
        )}
      </NFTNameContainer>
    </CardContent>
  )
}

const NFTPictureContainer = styled(motion.div)`
  flex: 1;
  position: relative;
  background-color: ${({ theme }) => theme.bg.highlight};
  overflow: hidden;
`

const NFTCardStyled = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.bg.highlight};
  border-radius: var(--radius-big);
  border: 1px solid ${({ theme }) => theme.border.secondary};
  overflow: hidden;
  transition: all cubic-bezier(0.2, 0.65, 0.5, 1) 0.1s;
  height: 200px;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => colord(theme.bg.background2).lighten(0.02).toHex()};
    border: 1px solid ${({ theme }) => theme.border.primary};

    ${NFTPictureContainer} {
      filter: brightness(1.05);
    }
  }
`

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const NFTNameContainer = styled.div`
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  align-self: center;
`

const NFTName = styled(Truncate)`
  overflow: hidden;
  text-align: center;
  font-weight: 600;
  text-overflow: ellipsis;
`

const EllipsedStyled = styled(Ellipsed)`
  text-align: center;
`
