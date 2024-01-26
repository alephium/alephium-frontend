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

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiGhostLine } from 'react-icons/ri'
import styled from 'styled-components'

import Card3D, { card3DHoverTransition } from '@/components/Cards/Card3D'
import SkeletonLoader from '@/components/SkeletonLoader'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { UnverifiedNFTMetadataWithFile } from '@/types/assets'

interface NFTListProps {
  nfts: UnverifiedNFTMetadataWithFile[]
  isLoading?: boolean
}

const NFTList = ({ nfts, isLoading }: NFTListProps) => {
  const { t } = useTranslation()
  return (
    <NFTListContainer>
      {isLoading ? (
        <NFTListStyled>
          <SkeletonLoader height="200px" />
          <SkeletonLoader height="200px" />
          <SkeletonLoader height="200px" />
        </NFTListStyled>
      ) : nfts.length > 0 ? (
        <NFTListStyled>
          {nfts.map((nft) => (
            <NFTItem key={nft.id} nft={nft} />
          ))}
        </NFTListStyled>
      ) : (
        <NoNFTsMessage>
          <EmptyIconContainer>
            <RiGhostLine />
          </EmptyIconContainer>
          <div>{t('No NFTs yet')}</div>
        </NoNFTsMessage>
      )}
    </NFTListContainer>
  )
}

interface NFTItemProps {
  nft: UnverifiedNFTMetadataWithFile
}

const NFTItem = ({ nft }: NFTItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

  const desc = nft.file?.description
  const cutDesc = desc && desc?.length > 200 ? nft.file?.description?.substring(0, 200) + '...' : desc

  const y = useMotionValue(0.5)
  const x = useMotionValue(0.5)

  const springConfig = { damping: 10, stiffness: 100 }
  const xSpring = useSpring(x, springConfig)
  const ySpring = useSpring(y, springConfig)

  const imagePosX = useTransform(xSpring, [0, 1], ['5px', '-5px'], {
    clamp: true
  })
  const imagePosY = useTransform(ySpring, [0, 1], ['5px', '-5px'], {
    clamp: true
  })

  const handlePointerMove = (pointerX: number, pointerY: number) => {
    x.set(pointerX, true)
    y.set(pointerY, true)
  }

  return (
    <NFTCardStyled
      onPointerMove={handlePointerMove}
      onCardHover={setIsHovered}
      frontFace={
        <FrontFace>
          <NFTPictureContainer>
            <PictureContainerShadow animate={{ opacity: isHovered ? 1 : 0 }} />
            <NFTPicture
              style={{
                backgroundImage: `url(${nft.file?.image})`,
                x: imagePosX,
                y: imagePosY,
                scale: 1.5
              }}
              animate={{
                scale: isHovered ? 1 : 1.5
              }}
              transition={card3DHoverTransition}
            />
          </NFTPictureContainer>
          <NFTName>{nft.file?.name}</NFTName>
        </FrontFace>
      }
      backFace={
        <BackFace>
          <BackFaceBackground style={{ backgroundImage: `url(${nft.file?.image})` }} />
          <NFTDescription>{cutDesc}</NFTDescription>
        </BackFace>
      }
    />
  )
}

export default NFTList

const NFTListContainer = styled.div`
  display: flex;
`

const NFTListStyled = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 25px;
  padding: 15px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 0 0 12px 12px;

  @media ${deviceBreakPoints.laptop} {
    grid-template-columns: repeat(4, 1fr);
  }

  @media ${deviceBreakPoints.tablet} {
    grid-template-columns: repeat(3, 1fr);
  }

  @media ${deviceBreakPoints.mobile} {
    grid-template-columns: repeat(2, 1fr);
  }

  @media ${deviceBreakPoints.tiny} {
    grid-template-columns: repeat(1, 1fr);
  }
`

const NFTCardStyled = styled(Card3D)`
  background-color: ${({ theme }) => theme.bg.primary};
`

const FrontFace = styled.div`
  padding: 10px;
`

const BackFace = styled.div`
  padding: 20px;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background2};
  border-radius: 9px;
`

const NFTPictureContainer = styled(motion.div)`
  position: relative;
  border-radius: 9px;
  overflow: hidden;
`

const PictureContainerShadow = styled(motion.div)`
  position: absolute;
  height: 100%;
  width: 100%;
  box-shadow: inset 0 0 30px black;
  z-index: 2;
`

const NFTPicture = styled(motion.div)`
  max-width: 100%;
  height: 150px;
  background-repeat: no-repeat;
  background-color: black;
  background-size: contain;
  background-position: center;
`

const NFTName = styled.div`
  margin-top: 15px;
  font-weight: 600;
  margin: 15px 0;
`

const NFTDescription = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  padding: 20px;
`

const BackFaceBackground = styled.div`
  position: absolute;
  background-size: cover;
  background-repeat: no-repeat;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  border-radius: 9px;
  opacity: 0.3;
`

const NoNFTsMessage = styled.div`
  display: flex;
  flex-direction: column;

  text-align: center;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.font.tertiary};
  margin: 20px auto;
  padding: 20px;
  border-radius: 9px;
  border: 2px dashed ${({ theme }) => theme.border.primary};
  font-size: 1.1em;
`

const EmptyIconContainer = styled.div`
  display: flex;
  margin-bottom: 10px;

  svg {
    height: 100%;
    width: 30px;
  }
`
