import { isListedFT } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { TokenDetailsModalCommonProps } from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { VERTICAL_GAP } from '~/style/globalStyle'

const TokenDetailsModalDescription = ({ tokenId }: TokenDetailsModalCommonProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (!token || !isListedFT(token) || !token.description) return null

  return (
    <TokenDetailsModalDescriptionStyled>
      <LeftAlignedText bold>{token.name}</LeftAlignedText>
      <LeftAlignedText>{token.description}</LeftAlignedText>
    </TokenDetailsModalDescriptionStyled>
  )
}

export default TokenDetailsModalDescription

const TokenDetailsModalDescriptionStyled = styled(EmptyPlaceholder)`
  margin-top: ${VERTICAL_GAP}px;
  justify-content: flex-start;
`

const LeftAlignedText = styled(AppText)`
  align-self: flex-start;
`
