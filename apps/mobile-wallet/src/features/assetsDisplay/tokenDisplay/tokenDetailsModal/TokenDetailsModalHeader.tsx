import { CURRENCIES, selectPriceById } from '@alephium/shared'
import { useMemo } from 'react'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import Badge from '~/components/Badge'
import { TokenDetailsModalCommonProps } from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'

const TokenDetailsModalHeader = ({ tokenId, addressHash }: TokenDetailsModalCommonProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const token = knownFungibleTokens.find((token) => token.id === tokenId)

  if (!token) return null

  return (
    <TokenDetailsModalHeaderStyled>
      <AssetLogo assetId={tokenId} size={26} />
      <TokenName bold numberOfLines={1} size={16}>
        {token.name}
      </TokenName>
      <TokenPrice tokenSymbol={token.symbol} />
    </TokenDetailsModalHeaderStyled>
  )
}

export default TokenDetailsModalHeader

const TokenPrice = ({ tokenSymbol }: { tokenSymbol: string }) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const price = useAppSelector((s) => selectPriceById(s, tokenSymbol)?.price)

  if (price === undefined || price === null) return null

  return (
    <Badge>
      <Amount semiBold isFiat value={price} suffix={CURRENCIES[currency].symbol} fadeSuffix size={13} />
      <AppText size={13}> / {tokenSymbol}</AppText>
    </Badge>
  )
}

const TokenDetailsModalHeaderStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
`

const TokenName = styled(AppText)`
  flex: 1;
  overflow: hidden;
`
