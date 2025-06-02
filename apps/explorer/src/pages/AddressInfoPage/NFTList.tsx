import { NFT } from '@alephium/shared'
import { useFetchAddressNfts } from '@alephium/shared-react'
import { colord } from 'colord'
import { motion } from 'framer-motion'
import { groupBy, orderBy } from 'lodash'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiGhostLine } from 'react-icons/ri'
import styled from 'styled-components'

import { queries } from '@/api'
import NFTThumbnail from '@/components/NFTThumbnail'
import SkeletonLoader from '@/components/SkeletonLoader'
import Toggle from '@/components/Toggle'
import { useQueriesData } from '@/hooks/useQueriesData'
import useStateWithLocalStorage from '@/hooks/useStateWithLocalStorage'
import ModalPortal from '@/modals/ModalPortal'
import NFTDetailsModal from '@/pages/AddressInfoPage/NFTDetailsModal'
import { deviceBreakPoints } from '@/styles/globalStyles'
import { OnOff } from '@/types/generics'

interface NFTListProps {
  addressStr: string
}

const NFTList = ({ addressStr }: NFTListProps) => {
  const { t } = useTranslation()
  const [consultedNftId, setConsultedNftId] = useState<string>()
  const [isCollectionGroupingActive, setIsCollectionGroupingActive] = useStateWithLocalStorage<OnOff>(
    'NFTCollectionGrouping',
    'off'
  )

  const { data: _nfts, isLoading: isLoading } = useFetchAddressNfts(addressStr)
  const nfts = _nfts || []

  const consultedNft = nfts?.find((nft) => nft.id === consultedNftId)

  let NFTsGroupedByCollection = groupBy(nfts, 'collectionId')

  const { undefined: undefinedCollectionNfts, ...rest } = NFTsGroupedByCollection
  NFTsGroupedByCollection = undefinedCollectionNfts ? { ...rest, undefined: undefinedCollectionNfts } : rest // Move undefined collection to the end

  const collectionIds = Object.keys(rest)

  const { data: collectionsMatadata } = useQueriesData(
    collectionIds.map((id) => queries.assets.metadata.NFTCollection(id))
  )

  const { data: collectionFiles } = useQueriesData(
    collectionsMatadata.map((meta) => queries.assets.NFTsData.collection(meta.collectionUri, meta.id, meta.address))
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
          collection={collectionFiles.find((c) => c.collectionId === consultedNft?.collectionId)}
          isOpen={!!consultedNftId}
          onClose={() => setConsultedNftId(undefined)}
        />
      </ModalPortal>
    </>
  )
}

interface NFTListComponentProps {
  nfts?: NFT[]
  onClick: (nftId: string) => void
}

const NFTListComponent = ({ nfts, onClick }: NFTListComponentProps) => {
  const orderedNFTs = orderBy(nfts, (nft) => !nft.collectionId)

  return (
    <NFTListStyled>
      {orderedNFTs
        ? orderedNFTs.map((nft) => <NFTItem key={nft.id} nft={nft} onClick={() => onClick(nft.id)} />)
        : null}
    </NFTListStyled>
  )
}

interface NFTItemProps {
  nft: NFT
  onClick: () => void
}

const NFTItem = ({ nft, onClick }: NFTItemProps) => (
  <NFTCardStyled onClick={onClick}>
    <NFTPictureContainer>
      <NFTThumbnail src={nft.image} showPlayIconIfVideo playOnHover />
    </NFTPictureContainer>
    <NFTName>{nft.name}</NFTName>
  </NFTCardStyled>
)

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
  background-color: ${({ theme }) => theme.bg.tertiary};
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

const NFTPictureContainer = styled(motion.div)`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
`

const NFTCardStyled = styled.div`
  display: flex;
  flex-direction: column;
  height: 260px;
  background-color: ${({ theme }) => theme.bg.primary};
  border-radius: 9px;
  overflow: hidden;

  &:hover {
    cursor: pointer;
    background-color: ${({ theme }) => theme.bg.hover};
    transition: all 0.1s ease-in-out;

    ${NFTPictureContainer} {
      filter: brightness(1.1);
    }
  }
`

const NFTName = styled.div`
  padding: 15px 0;
  font-weight: 600;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
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
