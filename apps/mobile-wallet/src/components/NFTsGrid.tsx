import { AddressHash, NFT } from '@alephium/shared'
import { FlashList, FlashListProps } from '@shopify/flash-list'
import { ForwardedRef, forwardRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesNFTs } from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface NFTsGridProps extends Omit<Partial<FlashListProps<NFT>>, 'contentContainerStyle'> {
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
    ref: ForwardedRef<FlashList<NFT>>
  ) => {
    const selectAddressesNFTs = useMemo(makeSelectAddressesNFTs, [])
    const nfts = useAppSelector((s) => selectAddressesNFTs(s, addressHash))
    const isLoadingNfts = useAppSelector((s) => s.nfts.loading)
    const theme = useTheme()
    const { t } = useTranslation()

    const data = nftsProp ?? nfts
    const columns = nftsPerRow

    return (
      <FlashList
        {...props}
        data={data}
        ref={ref}
        overScrollMode="auto"
        keyExtractor={(item) => item.id}
        renderItem={({ item: nft }) => (
          <NFTThumbnailContainer key={nft.id}>
            <NFTThumbnail nftId={nft.id} />
          </NFTThumbnailContainer>
        )}
        contentContainerStyle={{ paddingHorizontal: containerHorizontalPadding, paddingBottom: 70 }}
        numColumns={columns}
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
  overflow: hidden;
  padding: 5px;
`
