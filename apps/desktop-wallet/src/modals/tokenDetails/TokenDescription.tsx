import styled from 'styled-components'

import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import { isListedFT } from '@/types/tokens'

const TokenDescription = ({ tokenId }: TokenDetailsModalProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isListedFT(token)) return null

  return <TokenDescriptionStyled>{token.description}</TokenDescriptionStyled>
}

export default TokenDescription

const TokenDescriptionStyled = styled.div`
  margin: var(--spacing-4);
  color: ${({ theme }) => theme.font.secondary};
`
