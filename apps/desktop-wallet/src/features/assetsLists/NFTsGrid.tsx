import { useInfiniteQuery } from '@tanstack/react-query'
import { motion, useInView } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { fadeIn } from '@/animations'
import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import EmptyPlaceholder from '@/components/EmptyPlaceholder'
import NFTCard from '@/components/NFTCard'
import SkeletonLoader from '@/components/SkeletonLoader'
import Spinner from '@/components/Spinner'
import { AddressModalBaseProp } from '@/features/modals/modalTypes'
import { deviceBreakPoints } from '@/style/globalStyles'
import { TokenId } from '@/types/tokens'

const PAGE_SIZE = 12

export const AddressNFTsGrid = ({ addressHash }: AddressModalBaseProp) => {
  const { t } = useTranslation()
  const {
    data: { nftIds },
    isLoading
  } = useFetchAddressTokensByType(addressHash)

  return (
    <NFTsGrid
      columns={4}
      nftIds={nftIds}
      isLoading={isLoading}
      placeholderText={t("This address doesn't have any NFTs yet.")}
    />
  )
}

export const WalletNFTsGrid = () => {
  const { t } = useTranslation()
  const {
    data: { nftIds },
    isLoading
  } = useFetchWalletTokensByType({ includeHidden: false })

  return (
    <NFTsGrid
      columns={6}
      nftIds={nftIds}
      isLoading={isLoading}
      placeholderText={t("The wallet doesn't have any NFTs. NFTs of all your addresses will appear here.")}
    />
  )
}

interface NFTsGridProps {
  columns: number
  nftIds: TokenId[]
  isLoading: boolean
  placeholderText: string
}

const NFTsGrid = ({ columns, nftIds, isLoading, placeholderText }: NFTsGridProps) => {
  const { data, fetchNextPage, hasNextPage } = useFetchPaginatedNFTs({ nftIds })

  const ref = useRef(null)
  const isInView = useInView(ref)

  useEffect(() => {
    if (isInView && hasNextPage) fetchNextPage()
  }, [isInView, fetchNextPage, hasNextPage])

  return (
    <motion.div {...fadeIn}>
      {!isLoading && nftIds.length === 0 && <EmptyPlaceholder emoji="🖼️">{placeholderText}</EmptyPlaceholder>}

      {(isLoading || nftIds.length > 0) && (
        <>
          <Grid columns={columns}>
            {isLoading ? (
              <NFTsLoader />
            ) : (
              data?.pages.map((page) => page.nfts.map((nftId) => <NFTCard key={nftId} nftId={nftId} />))
            )}
          </Grid>

          <GridBottom ref={ref}>{hasNextPage && <Spinner size="15px" />}</GridBottom>
        </>
      )}
    </motion.div>
  )
}

interface UseFetchPaginatedNFTsProps {
  nftIds: TokenId[]
  pageSize?: number
}

const useFetchPaginatedNFTs = ({ nftIds, pageSize = PAGE_SIZE }: UseFetchPaginatedNFTsProps) =>
  useInfiniteQuery({
    queryKey: ['paginatedNFTs', { nftIds, pageSize }],
    queryFn: ({ pageParam = 0 }) => {
      const start = pageParam * pageSize
      const end = start + pageSize
      const nfts = nftIds.slice(start, end)

      return {
        nfts,
        nextCursor: end < nftIds.length ? pageParam + 1 : undefined
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: nftIds.length > 0
  })

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
  margin-top: var(--spacing-4);

  ${({ columns }) =>
    !columns &&
    css`
      @media ${deviceBreakPoints.desktop} {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    `}
`

const GridBottom = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
  width: 100%;
`
