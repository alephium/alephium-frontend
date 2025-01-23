import { Asset, selectFungibleTokenById, selectNFTById } from '@alephium/shared'
import styled from 'styled-components/native'

import Amount, { AmountProps } from '~/components/Amount'
import AssetLogo from '~/components/AssetLogo'
import NFTThumbnail from '~/components/NFTThumbnail'
import { useAppSelector } from '~/hooks/redux'

interface AssetAmountWithLogoProps
  extends Pick<AmountProps, 'fullPrecision' | 'useTinyAmountShorthand' | 'showPlusMinus'> {
  assetId: Asset['id']
  amount: bigint
  logoSize?: number
  logoPosition?: 'left' | 'right'
}

const AssetAmountWithLogo = ({
  assetId,
  amount,
  useTinyAmountShorthand,
  fullPrecision,
  showPlusMinus,
  logoSize = 18,
  logoPosition = 'left'
}: AssetAmountWithLogoProps) => {
  const asset = useAppSelector((s) => selectFungibleTokenById(s, assetId))
  const nft = useAppSelector((s) => selectNFTById(s, assetId))

  const Logo = <AssetLogo assetId={assetId} size={logoSize} />

  return nft ? (
    <NFTThumbnail key={nft.id} nftId={nft.id} size={50} />
  ) : (
    <AssetStyled key={assetId}>
      {logoPosition === 'left' && Logo}
      <AmountStyled
        value={amount}
        isUnknownToken={!asset?.symbol}
        suffix={asset?.symbol}
        decimals={asset?.decimals}
        semiBold
        fadeSuffix
        fullPrecision={fullPrecision}
        useTinyAmountShorthand={useTinyAmountShorthand}
        showPlusMinus={showPlusMinus}
        highlight={showPlusMinus}
      />
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
