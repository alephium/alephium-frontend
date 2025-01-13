import { Asset, CURRENCIES } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AppText from '~/components/AppText'
import AssetLogo from '~/components/AssetLogo'
import ListItem from '~/components/ListItem'
import { useAppSelector } from '~/hooks/redux'

interface TokenListItemProps {
  asset: Asset
  isLast?: boolean
  style?: StyleProp<ViewStyle>
  hideSeparator?: boolean
}

const TokenListItem = ({ asset, isLast, style, hideSeparator }: TokenListItemProps) => {
  const currency = useAppSelector((s) => s.settings.currency)
  const { t } = useTranslation()

  const balance = BigInt(asset.balance)

  return (
    <ListItem
      style={style}
      isLast={isLast}
      title={asset.name || asset.id}
      subtitle={
        !asset.verified && (
          <UnverifiedBadge>
            <AppText size={10} color="tertiary">
              {t('No metadata')}
            </AppText>
          </UnverifiedBadge>
        )
      }
      icon={<AssetLogo assetId={asset.id} size={38} />}
      rightSideContent={
        <Amounts>
          <AmountStyled
            value={balance}
            decimals={asset.decimals}
            isUnknownToken={!asset.symbol}
            fadeDecimals
            suffix={asset.symbol}
            bold
            useTinyAmountShorthand
          />
          {asset.worth !== undefined && (
            <FiatAmountStyled isFiat value={asset.worth} suffix={CURRENCIES[currency].symbol} color="secondary" />
          )}
        </Amounts>
      }
      hideSeparator={hideSeparator}
    />
  )
}

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

const Amounts = styled.View``

const FiatAmountStyled = styled(Amount)`
  flex-shrink: 0;
  align-self: flex-end;
  margin-top: 5px;
`
