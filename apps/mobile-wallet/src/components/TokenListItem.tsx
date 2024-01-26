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
import { Asset } from '@alephium/shared'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'

interface TokenListItemProps {
  asset: Asset
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  hideSeparator?: boolean
}

const TokenListItem = ({ asset, isLast, style, hideSeparator }: TokenListItemProps) => (
  <ListItem
    style={style}
    isLast={isLast}
    title={asset.name || asset.id}
    subtitle={
      !asset.verified && (
        <UnverifiedBadge>
          <AppText size={10} color="tertiary">
            Unverified
          </AppText>
        </UnverifiedBadge>
      )
    }
    icon={<AssetLogo assetId={asset.id} size={38} />}
    rightSideContent={
      <AmountStyled
        value={BigInt(asset.balance)}
        decimals={asset.decimals}
        isUnknownToken={!asset.symbol}
        fadeDecimals
        suffix={asset.symbol}
        bold
        useTinyAmountShorthand
      />
    }
    hideSeparator={hideSeparator}
  />
)

export default TokenListItem

const AmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: center;
`

const UnverifiedBadge = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 1px 2px;
  border-radius: 4px;
  align-self: flex-start;
  margin-top: 3px;
`
