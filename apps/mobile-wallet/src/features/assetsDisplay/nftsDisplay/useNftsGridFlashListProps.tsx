import { NFT } from '@alephium/shared'
import { FlashListProps } from '@shopify/flash-list'
import { chunk, groupBy } from 'lodash'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import NFTThumbnail from '~/components/NFTThumbnail'
import NftsCollectionTitle from '~/features/assetsDisplay/nftsDisplay/NftsCollectionTitle'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface UseNftsGridFlashListPropsProps {
  nfts?: NFT[]
  isLoading?: boolean
  nftsPerRow?: number
  nftSize?: number
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const useNftsGridFlashListProps = ({
  nfts,
  nftsPerRow = 3,
  isLoading
}: UseNftsGridFlashListPropsProps): FlashListProps<NFT[] | NFT['collectionId']> => {
  const theme = useTheme()
  const { t } = useTranslation()
  const data = useMemo(
    () =>
      Object.entries(groupBy(nfts, 'collectionId'))
        .map(([collectionId, nfts]) => [collectionId, ...chunk(nfts, nftsPerRow)])
        .flat(),
    [nfts, nftsPerRow]
  )

  return {
    data,
    overScrollMode: 'auto',
    keyExtractor: (item) => (typeof item === 'string' ? item : item[0].id),
    getItemType: (item) => (typeof item === 'string' ? 'sectionHeader' : 'row'),
    renderItem: ({ item, index }) =>
      typeof item === 'string' ? (
        <NftsCollectionTitle collectionId={item} isFirst={index === 0} />
      ) : (
        <NftsRow nftsPerRow={nftsPerRow}>
          {item.map((nft) => (
            <NFTThumbnailContainer key={nft.id}>
              <NFTThumbnail nftId={nft.id} />
            </NFTThumbnailContainer>
          ))}
        </NftsRow>
      ),
    contentContainerStyle: { paddingHorizontal: DEFAULT_MARGIN, paddingBottom: 70 },
    ListEmptyComponent: isLoading ? (
      <EmptyPlaceholder>
        <AppText color={theme.font.tertiary}>👀</AppText>
        <ActivityIndicator />
      </EmptyPlaceholder>
    ) : (
      <EmptyPlaceholder>
        <AppText size={32}>👻</AppText>
        <AppText color={theme.font.secondary}>{t('No NFTs yet')}</AppText>
      </EmptyPlaceholder>
    )
  }
}

export default useNftsGridFlashListProps

const NFTThumbnailContainer = styled.View`
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  padding: 5px;
`

const NftsRow = styled.View<{ nftsPerRow: number }>`
  flex-direction: row;
  aspect-ratio: ${({ nftsPerRow }) => nftsPerRow / 1};
`
