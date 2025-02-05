import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import HashEllipsed from '@/components/HashEllipsed'
import Truncate from '@/components/Truncate'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'

const Header = ({ tokenId }: TokenDetailsModalProps) => (
  <HeaderStyled>
    <LeftSide>
      <TokenLogo tokenId={tokenId} />
      <TokenName tokenId={tokenId} />
    </LeftSide>
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
  gap: 15px;
`

const TruncateStyled = styled(Truncate)`
  font-size: 18px;
  font-weight: var(--fontWeight-semiBold);
`
