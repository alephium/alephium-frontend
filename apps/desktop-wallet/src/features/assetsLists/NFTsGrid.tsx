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

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeIn } from '@/animations'
import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import NFTCard from '@/components/NFTCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import { TableRow } from '@/components/Table'
import ExpandRowButton from '@/features/assetsLists/ExpandRowButton'
import { AddressTokensTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'
import { deviceBreakPoints } from '@/style/globalStyles'
import { TokenId } from '@/types/tokens'

export const AddressNFTsGrid = ({ addressHash, ...props }: AddressTokensTabsProps) => {
  const {
    data: { nftIds },
    isLoading
  } = useFetchAddressTokensByType(addressHash)

  return <NFTsGrid {...props} columns={4} nftIds={nftIds} isLoading={isLoading} />
}

export const WalletNFTsGrid = (props: TokensTabsBaseProps) => {
  const {
    data: { nftIds },
    isLoading
  } = useFetchWalletTokensByType()

  return <NFTsGrid {...props} columns={5} nftIds={nftIds} isLoading={isLoading} />
}

interface NFTsGridProps extends TokensTabsBaseProps {
  columns: number
  nftIds: TokenId[]
  isLoading: boolean
}

const NFTsGrid = ({ className, isExpanded, onExpand, columns, nftIds, isLoading }: NFTsGridProps) => (
  <>
    <motion.div {...fadeIn} className={className}>
      <Grid role="row" tabIndex={isExpanded ? 0 : -1} columns={columns}>
        {isLoading ? (
          <NFTsLoader />
        ) : nftIds.length === 0 ? (
          <NoNFTsPlaceholder />
        ) : (
          nftIds.map((nftId) => <NFTCard key={nftId} nftId={nftId} />)
        )}
      </Grid>
    </motion.div>

    <ExpandRowButton isExpanded={isExpanded} onExpand={onExpand} isEnabled={nftIds.length > 4} />
  </>
)

const NFTsLoader = () => (
  <>
    <SkeletonLoader height="205px" />
    <SkeletonLoader height="205px" />
    <SkeletonLoader height="205px" />
    <SkeletonLoader height="205px" />
  </>
)

const NoNFTsPlaceholder = () => {
  const { t } = useTranslation()

  return <PlaceholderText>{t('No NFTs found.')}</PlaceholderText>
}

const PlaceholderText = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Grid = styled(TableRow)<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
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
