/*
Copyright 2018 - 2023 The Alephium Authors
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

import { colord } from 'colord'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { groupBy } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiGhostLine } from 'react-icons/ri'
import styled from 'styled-components'

import { queries } from '@/api'
import Card3D, { card3DHoverTransition } from '@/components/Cards/Card3D'
import SkeletonLoader from '@/components/SkeletonLoader'
import Toggle from '@/components/Toggle'
import { useQueriesData } from '@/hooks/useQueriesData'
import useStateWithLocalStorage from '@/hooks/useStateWithLocalStorage'
import ModalPortal from '@/modals/ModalPortal'
import NFTDetailsModal from '@/pages/AddressInfoPage/NFTDetailsModal'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { NFTMetadataWithFile } from '@/types/assets'
import { OnOff } from '@/types/generics'

interface NFTListProps {
  nfts: NFTMetadataWithFile[]
  isLoading?: boolean
}

const NFTList = ({ nfts, isLoading }: NFTListProps) => {
  const { t } = useTranslation()
  const [consultedNftId, setConsultedNftId] = useState<string | undefined>(undefined)
  const [isCollectionGroupingActive, setIsCollectionGroupingActive] = useStateWithLocalStorage<OnOff>(
    'NFTCollectionGrouping',
    'off'
  )
  const consultedNft = nfts.find((nft) => nft.id === consultedNftId)

  let NFTsGroupedByCollection = groupBy(nfts, 'collectionId')

  const { undefined: undefinedCollectionNfts, ...rest } = NFTsGroupedByCollection
  NFTsGroupedByCollection = undefinedCollectionNfts ? { ...rest, undefined: undefinedCollectionNfts } : rest // Move undefined collection to the end

  const collectionIds = Object.keys(NFTsGroupedByCollection).filter((id) => id !== 'undefined')

  const { data: collectionsMatadata } = useQueriesData(
    collectionIds.map((id) => ({
      ...queries.assets.metadata.NFTCollection(id)
    }))
  )

  const { data: collectionFiles } = useQueriesData(
    collectionsMatadata.map((meta) => ({
      ...queries.assets.NFTsData.collection(meta.collectionUri, meta.id, meta.address)
    }))
  )

  const handleCollectionToggle = () => {
    setIsCollectionGroupingActive((p) => (p === 'on' ? 'off' : 'on'))
  }

  return (
    <>
      <NFTListContainer>
        <Toolbar>
          <ToggleLabel>{t('Group by collection')}</ToggleLabel>
          <Toggle
            label={t('Group by collection')}
            toggled={isCollectionGroupingActive === 'on'}
            onToggle={handleCollectionToggle}
          />
        </Toolbar>
        {isLoading ? (
          <NFTListStyled>
            <SkeletonLoader height="200px" />
            <SkeletonLoader height="200px" />
            <SkeletonLoader height="200px" />
          </NFTListStyled>
        ) : nfts.length > 0 ? (
          isCollectionGroupingActive === 'on' ? (
            Object.entries(NFTsGroupedByCollection).map(([collectionId, nfts]) => (
              <CollectionContainer key={collectionId}>
                <CollectionHeader>
                  {collectionId === 'undefined'
                    ? t('Unknown collection')
                    : collectionFiles.find((c) => c.collectionId === collectionId)?.name}
                </CollectionHeader>
                <NFTListComponent nfts={nfts} onClick={setConsultedNftId} />
              </CollectionContainer>
            ))
          ) : (
            <NFTListComponent nfts={nfts} onClick={setConsultedNftId} />
          )
        ) : (
          <NoNFTsMessage>
            <EmptyIconContainer>
              <RiGhostLine />
            </EmptyIconContainer>
            <div>{t('No NFTs yet')}</div>
          </NoNFTsMessage>
        )}
      </NFTListContainer>
      <ModalPortal>
        <NFTDetailsModal
          nft={consultedNft}
          isOpen={!!consultedNftId}
          onClose={() => setConsultedNftId(undefined)}
          maxWidth={800}
        />
      </ModalPortal>
    </>
  )
}

interface NFTListComponentProps {
  nfts?: NFTMetadataWithFile[]
  onClick: (nftId: string) => void
}

const NFTListComponent = ({ nfts, onClick }: NFTListComponentProps) => (
  <NFTListStyled>
    {nfts ? nfts.map((nft) => <NFTItem key={nft.id} nft={nft} onClick={() => onClick(nft.id)} />) : null}
  </NFTListStyled>
)

interface NFTItemProps {
  nft: NFTMetadataWithFile
  onClick: (nftId: string) => void
}

const NFTItem = ({ nft, onClick }: NFTItemProps) => {
  const [isHovered, setIsHovered] = useState(false)

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
      onClick={() => onClick(nft.id)}
      shouldFlip={false}
      frontFace={
        <FrontFace>
          <NFTPictureContainer>
            <PictureContainerShadow animate={{ opacity: isHovered ? 1 : 0 }} />
            {nft.file?.image ? (
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
            ) : (
              <NFTPicture style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MissingMetadataText>Missing image</MissingMetadataText>
              </NFTPicture>
            )}
          </NFTPictureContainer>
          {nft.file?.name ? (
            <NFTName>{nft.file?.name}</NFTName>
          ) : (
            <MissingMetadataText>Missing metadata</MissingMetadataText>
          )}
        </FrontFace>
      }
    />
  )
}

export default NFTList

const NFTListContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 0 0 8px 8px;
  overflow-y: auto;
  max-height: 700px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const Toolbar = styled.div`
  flex-shrink: 0;
  padding: 0 15px;
  margin: 15px 15px 5px;
  border-radius: 4px;
  height: 50px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background-color: ${({ theme }) => theme.bg.background1};
`

const NFTListStyled = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  padding: 15px;

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

const NFTPictureContainer = styled(motion.div)`
  position: relative;
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
  padding: 15px 0;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
`

const MissingMetadataText = styled(NFTName)`
  color: ${({ theme }) => theme.font.secondary};
  font-style: italic;
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
  border-radius: 8px;
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

const CollectionContainer = styled.div``

const CollectionHeader = styled.div`
  position: sticky;
  top: 0;
  flex-shrink: 0;
  z-index: 1;
  height: 50px;
  margin: 10px 15px;
  border-radius: 4px;
  background-color: ${({ theme }) => colord(theme.bg.background2).alpha(0.9).toHex()};
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-size: 14px;
  font-weight: 600;

  backdrop-filter: blur(10px);
`

const ToggleLabel = styled.div`
  margin-right: 5px;
`
