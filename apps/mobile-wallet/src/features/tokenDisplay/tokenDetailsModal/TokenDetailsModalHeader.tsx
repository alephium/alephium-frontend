import { CURRENCIES, selectPriceById } from '@alephium/shared'
import { useMemo } from 'react'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import { TokenDetailsModalCommonProps } from '~/features/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'

const TokenDetailsModalHeader = ({ tokenId, addressHash }: TokenDetailsModalCommonProps) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash))
  const token = knownFungibleTokens.find((token) => token.id === tokenId)

  if (!token) return null

  return (
    <TokenDetailsModalHeaderStyled>
      <LeftColumn>
        <AssetLogo assetId={tokenId} size={38} />

        <TokenName bold numberOfLines={1} size={18}>
          {token.name}
        </TokenName>
      </LeftColumn>
      <RightColumn>
        <TokenPrice tokenSymbol={token.symbol} />
      </RightColumn>
    </TokenDetailsModalHeaderStyled>
  )
}

export default TokenDetailsModalHeader

const TokenPrice = ({ tokenSymbol }: { tokenSymbol: string }) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const price = useAppSelector((s) => selectPriceById(s, tokenSymbol)?.price)

  if (price === undefined || price === null) return null

  return <Amount semiBold isFiat value={price} suffix={CURRENCIES[currency].symbol} fadeSuffix />
}

const TokenDetailsModalHeaderStyled = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`

const Column = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
`

const LeftColumn = styled(Column)`
  flex-shrink: 1;
`

const RightColumn = styled(Column)`
  flex-grow: 1;
  justify-content: flex-end;
`

const TokenName = styled(AppText)`
  flex-shrink: 1;
  overflow: hidden;
`
