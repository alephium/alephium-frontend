/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { NFT } from '@alephium/shared'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import styled from 'styled-components'

import useFetchNft from '@/api/apiDataHooks/token/useFetchNft'
import NFTThumbnail from '@/components/NFTThumbnail'
import SkeletonLoader from '@/components/SkeletonLoader'
import Truncate from '@/components/Truncate'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

interface NFTCardProps {
  nftId: NFT['id']
}

const NFTCard = ({ nftId }: NFTCardProps) => {
  const dispatch = useAppDispatch()

  const { data: nft, isLoading } = useFetchNft({ id: nftId })

  const openNFTDetailsModal = () => dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId } }))

  return (
    <NFTCardStyled onClick={openNFTDetailsModal}>
      <CardContent>
        <NFTPictureContainer>
          <NFTThumbnail nftId={nftId} size="100%" />
        </NFTPictureContainer>

        {nft ? <NFTName>{nft.name}</NFTName> : isLoading && <SkeletonLoader height="15px" />}
      </CardContent>
    </NFTCardStyled>
  )
}

export default NFTCard

const NFTCardStyled = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: var(--radius-huge);
  transition: all cubic-bezier(0.2, 0.65, 0.5, 1) 0.1s;
  height: 200px;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => colord(theme.bg.background2).darken(0.05).toHex()};
    transform: scale(1.02);
  }
`

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 10px 10px 0 10px;
  overflow: hidden;
`

const NFTPictureContainer = styled(motion.div)`
  flex: 1;
  position: relative;
  border-radius: var(--radius-big);
  overflow: hidden;
  background-color: ${({ theme }) => colord(theme.bg.background2).darken(0.06).toHex()};
`

const NFTName = styled(Truncate)`
  text-align: center;
  font-weight: 600;
  margin: 10px 0;
  max-width: 100%;
  text-overflow: ellipsis;
`
