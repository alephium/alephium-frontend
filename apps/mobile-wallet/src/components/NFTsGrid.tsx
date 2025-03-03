import { AddressHash, NFT } from '@alephium/shared'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { chunk, groupBy } from 'lodash'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import NFTThumbnail from '~/components/NFTThumbnail'
import NftsCollectionTitle from '~/features/assetsDisplay/nftsDisplay/NftsCollectionTitle'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesNFTs } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTsGridProps extends Omit<Partial<FlashListProps<NFT[] | NFT['collectionId']>>, 'contentContainerStyle'> {
  addressHash?: AddressHash
  nfts?: NFT[]
  nftsPerRow?: number
  nftSize?: number
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void
}

const containerHorizontalPadding = DEFAULT_MARGIN

const NFTsGrid = forwardRef(
  (
    { addressHash, nfts: nftsProp, nftSize, nftsPerRow = 3, scrollEnabled, ...props }: NFTsGridProps,
    ref: ForwardedRef<FlashList<NFT[] | NFT['collectionId']>>
  ) => {
    const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
    const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
    const isLoadingNfts = useAppSelector((s) => s.nfts.loading)
    const theme = useTheme()
    const { t } = useTranslation()

    const data = Object.entries(groupBy(nftsProp ?? nfts, 'collectionId'))
      .map(([collectionId, nfts]) => [collectionId, ...chunk(nfts, nftsPerRow)])
      .flat()

    return (
      <FlashList
        {...props}
        data={data}
        ref={ref}
        overScrollMode="auto"
        keyExtractor={(item) => (typeof item === 'string' ? item : item[0].id)}
        getItemType={(item) => (typeof item === 'string' ? 'sectionHeader' : 'row')}
        renderItem={({ item, index }) =>
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
          )
        }
        contentContainerStyle={{ paddingHorizontal: containerHorizontalPadding, paddingBottom: 70 }}
        estimatedItemSize={props.estimatedItemSize || 64}
        ListEmptyComponent={
          isLoadingNfts ? (
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
      />
    )
  }
)

export default NFTsGrid

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
