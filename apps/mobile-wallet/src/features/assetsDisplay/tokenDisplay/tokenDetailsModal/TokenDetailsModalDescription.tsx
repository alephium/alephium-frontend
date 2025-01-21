import { useMemo } from 'react'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { TokenDetailsModalCommonProps } from '~/features/assetsDisplay/tokenDisplay/tokenDetailsModal/tokenDetailsModalTypes'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesTokens } from '~/store/addresses/addressesSelectors'
import { VERTICAL_GAP } from '~/style/globalStyle'

const TokenDetailsModalDescription = ({ tokenId, addressHash }: TokenDetailsModalCommonProps) => {
  const selectAddressesTokens = useMemo(makeSelectAddressesTokens, [])
  const tokens = useAppSelector((s) => selectAddressesTokens(s, addressHash))
  const token = tokens.find((token) => token.id === tokenId)

  if (!token || !token.description) return null

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
