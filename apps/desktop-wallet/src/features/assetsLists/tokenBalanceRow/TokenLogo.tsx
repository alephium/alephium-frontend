import styled from 'styled-components'

import AssetLogo from '@/components/AssetLogo'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

const TokenLogo = ({ tokenId }: TokenBalancesRowBaseProps) => <TokenLogoStyled tokenId={tokenId} size={28} />

export default TokenLogo

const TokenLogoStyled = styled(AssetLogo)`
  margin-right: 20px;
`
