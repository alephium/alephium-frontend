import { AddressHash, Asset } from '@alephium/shared'
import { Skeleton } from 'moti/skeleton'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, StyleProp, ViewStyle } from 'react-native'
import Animated, { CurvedTransition } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import UnknownTokensListItem, { UnknownTokensEntry } from '~/components/UnknownTokensListItem'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesCheckedUnknownTokens, makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  addressHash?: AddressHash
  isRefreshing?: boolean
  style?: StyleProp<ViewStyle>
}

type LoadingIndicator = {
  isLoadingTokens: boolean
}

type TokensRow = Asset | UnknownTokensEntry | LoadingIndicator

const AddressesTokensList = ({ addressHash, isRefreshing, style }: AddressesTokensListProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector((s) => selectAddressesCheckedUnknownTokens(s, addressHash))
  const isLoadingTokenBalances = useAppSelector((s) => s.loaders.loadingTokens)
  const isLoadingUnverified = useAppSelector((s) => s.fungibleTokens.loadingUnverified)
  const isLoadingVerified = useAppSelector((s) => s.fungibleTokens.loadingVerified)
  const isLoadingTokenTypes = useAppSelector((s) => s.fungibleTokens.loadingTokenTypes)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const theme = useTheme()
  const { t } = useTranslation()

  const showTokensSkeleton =
    (isLoadingTokenBalances || isLoadingUnverified || isLoadingVerified || isLoadingTokenTypes) &&
    addressesBalancesStatus === 'initialized'

  const [tokenRows, setTokenRows] = useState<TokensRow[]>([])

  useEffect(() => {
    const entries: TokensRow[] = [
      ...knownFungibleTokens,
      ...(unknownTokens.length > 0
        ? [
            {
              numberOfUnknownTokens: unknownTokens.length,
              addressHash
            }
          ]
        : []),
      ...(showTokensSkeleton ? [{ isLoadingTokens: true }] : [])
    ]

    setTokenRows(entries)
  }, [addressHash, showTokensSkeleton, knownFungibleTokens, unknownTokens.length])

  return (
    <ListContainer style={style} layout={CurvedTransition}>
      {tokenRows.map((entry, index) =>
        isAsset(entry) ? (
          <TokenListItem
            key={entry.id}
            asset={entry}
            hideSeparator={index === knownFungibleTokens.length - 1 && unknownTokens.length === 0}
          />
        ) : isUnknownTokens(entry) ? (
          <UnknownTokensListItem entry={entry} key="unknown-tokens" />
        ) : (
          <LoadingRow key="loading">
            <Skeleton show colorMode={theme.name} width={36} height={36} radius="round" />
            <Skeleton show colorMode={theme.name} width={200} height={36} />
          </LoadingRow>
        )
      )}
      {addressesBalancesStatus === 'uninitialized' ? (
        <EmptyPlaceholder>
          <AppText size={28}>⏳</AppText>
          <AppText>{t('Loading your balances...')}</AppText>
        </EmptyPlaceholder>
      ) : (
        !isRefreshing &&
        tokenRows.length === 0 && (
          <EmptyPlaceholder>
            <AppText size={28}>👀</AppText>
            <AppText>{t('No assets here, yet.')}</AppText>
          </EmptyPlaceholder>
        )
      )}

      {isRefreshing && (
        <>
          <LoadingOverlay />
          <Loader>
            <ActivityIndicator size={72} color={theme.font.tertiary} />
          </Loader>
        </>
      )}
    </ListContainer>
  )
}

export default styled(AddressesTokensList)`
  padding: 10px 0;
`

const LoadingRow = styled.View`
  flex-direction: row;
  gap: 15px;
  align-items: flex-start;
  padding-top: 15px;
  margin: 0 ${DEFAULT_MARGIN}px;
`

const ListContainer = styled(Animated.View)`
  border-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
  position: relative;
  margin: 0 ${DEFAULT_MARGIN}px;
`

const LoadingOverlay = styled.View`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.bg.back1};
  opacity: 0.8;
`

const Loader = styled.View`
  position: absolute;
  top: 30px;
  left: 0;
  right: 0;
  align-items: center;
`

const isAsset = (item: TokensRow): item is Asset => (item as Asset).id !== undefined

const isUnknownTokens = (item: TokensRow): item is UnknownTokensEntry =>
  (item as UnknownTokensEntry).numberOfUnknownTokens !== undefined
