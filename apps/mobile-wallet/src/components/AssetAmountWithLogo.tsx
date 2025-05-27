import { Asset, isFT, isNFT } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import styled from 'styled-components/native'

import Amount, { AmountProps } from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import NFTThumbnail from '~/components/NFTThumbnail'

interface AssetAmountWithLogoProps
  extends Pick<AmountProps, 'fullPrecision' | 'useTinyAmountShorthand' | 'showPlusMinus' | 'bold'> {
  assetId: Asset['id']
  amount: bigint
  logoSize?: number
  logoPosition?: 'left' | 'right'
}

const AssetAmountWithLogo = ({
  assetId,
  amount,
  logoSize = 18,
  logoPosition = 'left',
  ...props
}: AssetAmountWithLogoProps) => {
  const { data: token } = useFetchToken(assetId)

  if (!token) return null

  const Logo = <AssetLogo assetId={assetId} size={logoSize} />

  return isNFT(token) ? (
    <NFTThumbnail key={assetId} nftId={assetId} size={50} />
  ) : (
    <AssetStyled key={assetId}>
      {logoPosition === 'left' && Logo}

      {isFT(token) ? (
        <AmountStyled
          value={amount}
          suffix={token.symbol}
          decimals={token.decimals}
          fadeSuffix
          semiBold={!props.bold}
          {...props}
        />
      ) : (
        <AmountStyled value={amount} isUnknownToken fadeSuffix semiBold={!props.bold} {...props} />
      )}

      {logoPosition === 'right' && Logo}
    </AssetStyled>
  )
}

export default AssetAmountWithLogo

const AssetStyled = styled.View`
  flex-direction: row;
  gap: 5px;
  padding: 3px 0;
  border-radius: 24px;
  align-items: center;
`

const AmountStyled = styled(Amount)`
  flex-shrink: 1;
  text-align: right;
`
