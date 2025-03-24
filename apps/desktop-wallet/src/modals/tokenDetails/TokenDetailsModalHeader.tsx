import { isFT, isNFT } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import HashEllipsed from '@/components/HashEllipsed'
import Truncate from '@/components/Truncate'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import TokenDropdownOptions from '@/modals/tokenDetails/TokenOptions'

const Header = ({ tokenId }: TokenDetailsModalProps) => (
  <HeaderStyled>
    <LeftSide>
      <TokenLogo tokenId={tokenId} />
      <TokenName tokenId={tokenId} />
    </LeftSide>

    {tokenId !== ALPH.id && (
      <RightSide>
        <TokenDropdownOptions tokenId={tokenId} />
      </RightSide>
    )}
  </HeaderStyled>
)

export default Header

const TokenName = ({ tokenId }: TokenDetailsModalProps) => {
  const { data: token } = useFetchToken(tokenId)
  const { t } = useTranslation()

  if (!token) return null

  if (isFT(token)) return <TruncateStyled>{token.name}</TruncateStyled>

  if (isNFT(token)) return <HashEllipsed hash={tokenId} tooltipText={t('Copy token hash')} />

  return null
}

// TODO: DRY
const HeaderStyled = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

// TODO: DRY
const LeftSide = styled.div`
  display: flex;
  align-items: center;
`

const RightSide = styled(LeftSide)`
  margin-right: 15px;
`

const TruncateStyled = styled(Truncate)`
  font-size: 15px;
  font-weight: var(--fontWeight-semiBold);
`
