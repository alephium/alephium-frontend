import { AddressHash, Asset } from '@alephium/shared'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, View } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import UnknownTokensListItem, { UnknownTokensEntry } from '~/components/UnknownTokensListItem'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesCheckedUnknownTokens, makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'
import { BORDER_RADIUS_BIG } from '~/style/globalStyle'

import TokenListItem from './TokenListItem'

interface AddressesTokensListProps {
  addressHash?: AddressHash
  isRefreshing?: boolean
  parentModalId?: ModalInstance['id']
}

type LoadingIndicator = {
  isLoadingTokens: boolean
}

type TokensRow = Asset | UnknownTokensEntry | LoadingIndicator

const AddressesTokensList = ({ addressHash, isRefreshing, parentModalId }: AddressesTokensListProps) => {
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
    isRefreshing ||
    ((isLoadingTokenBalances || isLoadingUnverified || isLoadingVerified || isLoadingTokenTypes) &&
      addressesBalancesStatus === 'initialized')

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
        : [])
    ]

    setTokenRows(entries)
  }, [addressHash, showTokensSkeleton, knownFungibleTokens, unknownTokens.length])

  if (addressesBalancesStatus === 'uninitialized')
    return (
      <EmptyPlaceholder>
        <AppText size={28}>⏳</AppText>
        <AppText>{t('Loading your balances...')}</AppText>
      </EmptyPlaceholder>
    )

  if (!isRefreshing && tokenRows.length === 0)
    return (
      <EmptyPlaceholder>
        <AppText size={28}>👀</AppText>
        <AppText>{t('No assets here, yet.')}</AppText>
      </EmptyPlaceholder>
    )

  const LoadingSection = (props: ComponentProps<typeof View>) => (
    <LoadingSectionContainer {...props}>
      <ActivityIndicator size={72} color={theme.font.primary} />
    </LoadingSectionContainer>
  )

  return (
    <AddressesTokensListStyled>
      {showTokensSkeleton ? (
        <LoadingSection style={{ height: 60 * tokenRows.length }} />
      ) : (
        tokenRows.map((entry, index) =>
          isAsset(entry) ? (
            <TokenListItem
              key={entry.id}
              asset={entry}
              hideSeparator={index === knownFungibleTokens.length - 1 && unknownTokens.length === 0}
              addressHash={addressHash}
              parentModalId={parentModalId}
            />
          ) : (
            isUnknownTokens(entry) && <UnknownTokensListItem entry={entry} key="unknown-tokens" />
          )
        )
      )}
    </AddressesTokensListStyled>
  )
}

export default AddressesTokensList

const AddressesTokensListStyled = styled.View`
  padding: 10px 0;
  border-radius: ${BORDER_RADIUS_BIG}px;
  overflow: hidden;
  position: relative;
`

const LoadingSectionContainer = styled.View`
  width: 100%;
  align-items: center;
  padding-top: 100px;
`

const isAsset = (item: TokensRow): item is Asset => (item as Asset).id !== undefined

const isUnknownTokens = (item: TokensRow): item is UnknownTokensEntry =>
  (item as UnknownTokensEntry).numberOfUnknownTokens !== undefined
