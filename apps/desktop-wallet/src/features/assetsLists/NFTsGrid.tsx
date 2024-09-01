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
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeIn } from '@/animations'
import { useAddressesNFTsIds } from '@/api/addressesNftsDataHooks'
import NFTCard from '@/components/NFTCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import { ExpandRow, TableRow } from '@/components/Table'
import { AssetsTabsProps } from '@/features/assetsLists/types'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'
import { deviceBreakPoints } from '@/style/globalStyles'

const NFTsGrid = ({ className, addressHash, isExpanded, onExpand, nftColumns }: AssetsTabsProps) => {
  const { t } = useTranslation()
  const { data: nftIds, isLoading } = useAddressesNFTsIds(addressHash)
  const dispatch = useAppDispatch()

  const openNFTDetailsModal = (nftId: NFT['id']) => dispatch(openModal({ name: 'NFTDetailsModal', props: { nftId } }))

  return (
    <>
      <motion.div {...fadeIn} className={className}>
        <Grid role="row" tabIndex={isExpanded ? 0 : -1} columns={nftColumns}>
          {nftIds.map((nftId) => (
            <NFTCard key={nftId} nftId={nftId} onClick={() => openNFTDetailsModal(nftId)} />
          ))}
          {nftIds.length === 0 && <PlaceholderText>{t('No NFTs found.')}</PlaceholderText>}
          {isLoading && (
            <>
              <SkeletonLoader height="205px" />
              <SkeletonLoader height="205px" />
              <SkeletonLoader height="205px" />
              <SkeletonLoader height="205px" />
            </>
          )}
        </Grid>
      </motion.div>

      {!isExpanded && nftIds.length > 4 && onExpand && <ExpandRow onClick={onExpand} />}
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
