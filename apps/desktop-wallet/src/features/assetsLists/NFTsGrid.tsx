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
import ExpandRowButton from '@/features/assetsLists/ExpandRowButton'
import PlaceholderText from '@/features/assetsLists/PlaceholderText'
import { AddressTokensTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'
import { deviceBreakPoints } from '@/style/globalStyles'
import { TokenId } from '@/types/tokens'

export const AddressNFTsGrid = ({ addressHash, ...props }: AddressTokensTabsProps) => {
  const { t } = useTranslation()
  const {
    data: { nftIds },
    isLoading
  } = useFetchAddressTokensByType({ addressHash, includeAlph: false })

  return (
    <NFTsGrid
      {...props}
      columns={4}
      nftIds={nftIds}
      isLoading={isLoading}
      placeholderText={t("This address doesn't have any NFTs yet.")}
    />
  )
}

export const WalletNFTsGrid = (props: TokensTabsBaseProps) => {
  const { t } = useTranslation()
  const {
    data: { nftIds },
    isLoading
  } = useFetchWalletTokensByType({ includeAlph: false })

  return (
    <NFTsGrid
      {...props}
      columns={6}
      nftIds={nftIds}
      isLoading={isLoading}
      placeholderText={t("The wallet doesn't have any NFTs. NFTs of all your addresses will appear here.")}
    />
  )
}

interface NFTsGridProps extends TokensTabsBaseProps {
  columns: number
  nftIds: TokenId[]
  isLoading: boolean
  placeholderText: string
}

const NFTsGrid = ({ className, isExpanded, onExpand, columns, nftIds, isLoading, placeholderText }: NFTsGridProps) => (
  <>
    <motion.div {...fadeIn} className={className}>
      {!isLoading && nftIds.length === 0 && <PlaceholderText>{placeholderText}</PlaceholderText>}

      {isLoading ||
        (nftIds.length > 0 && (
          <Grid tabIndex={isExpanded ? 0 : -1} columns={columns}>
            {isLoading ? <NFTsLoader /> : nftIds.map((nftId) => <NFTCard key={nftId} nftId={nftId} />)}
          </Grid>
        ))}
    </motion.div>

    {isExpanded !== undefined && onExpand && (
      <ExpandRowButton isExpanded={isExpanded} onExpand={onExpand} isEnabled={nftIds.length > 4} />
    )}
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

const Grid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, minmax(0, 1fr));
  grid-auto-flow: initial;
  gap: 15px;
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
