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
import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeIn } from '@/animations'
import NFTCard from '@/components/NFTCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import { ExpandRow, TableRow } from '@/components/Table'
import { AssetsTabsProps } from '@/features/assetsLists/types'
import { useAppSelector } from '@/hooks/redux'
import ModalPortal from '@/modals/ModalPortal'
import NFTDetailsModal from '@/modals/NFTDetailsModal'
import { makeSelectAddressesNFTs, selectIsStateUninitialized } from '@/storage/addresses/addressesSelectors'
import { deviceBreakPoints } from '@/style/globalStyles'

const NFTsGrid = ({ className, addressHash, isExpanded, onExpand, nftColumns }: AssetsTabsProps) => {
  const { t } = useTranslation()
  const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
  const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
  const stateUninitialized = useAppSelector(selectIsStateUninitialized)
  const isLoadingNFTs = useAppSelector((s) => s.nfts.loading)
  const isLoadingTokenTypes = useAppSelector((s) => s.fungibleTokens.loadingTokenTypes)
  const [selectedNFTId, setSelectedNFTId] = useState<NFT['id']>()

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        {isLoadingNFTs || isLoadingTokenTypes || stateUninitialized ? (
          <Grid>
            <SkeletonLoader height="205px" />
            <SkeletonLoader height="205px" />
            <SkeletonLoader height="205px" />
            <SkeletonLoader height="205px" />
          </Grid>
        ) : (
          <Grid role="row" tabIndex={isExpanded ? 0 : -1} columns={nftColumns}>
            {nfts.map((nft) => (
              <NFTCard key={nft.id} nftId={nft.id} onClick={() => setSelectedNFTId(nft.id)} />
            ))}
            {nfts.length === 0 && <PlaceholderText>{t('No NFTs found.')}</PlaceholderText>}
          </Grid>
        )}
      </motion.div>

      {!isExpanded && nfts.length > 4 && onExpand && <ExpandRow onClick={onExpand} />}

      <ModalPortal>
        {selectedNFTId && <NFTDetailsModal nftId={selectedNFTId} onClose={() => setSelectedNFTId(undefined)} />}
      </ModalPortal>
    </>
  )
}

export default NFTsGrid

const PlaceholderText = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Grid = styled(TableRow)<{ columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns ?? 5}, minmax(0, 1fr));
  grid-auto-flow: initial;
  gap: 25px;
  padding: 15px;
  border-radius: 0 0 12px 12px;

  > * {
    width: 100%;
  }

  ${({ columns }) =>
    !columns &&
    css`
      @media ${deviceBreakPoints.desktop} {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    `}
`
