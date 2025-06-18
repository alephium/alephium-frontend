import { AddressHash } from '@alephium/shared'
import { useFetchAddressHiddenTokens, useFetchAddressTokensByType } from '@alephium/shared-react'
import styled from 'styled-components/native'

import { ButtonProps } from '~/components/buttons/Button'
import HiddenTokensButton from '~/components/tokensLists/HiddenTokensButton'
import UnknownTokensButton from '~/components/tokensLists/UnknownTokensButton'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressTokensListFooterProps {
  addressHash: AddressHash
  onHiddenTokensButtonPress?: () => void
}

const AddressTokensListFooter = ({ addressHash, onHiddenTokensButtonPress }: AddressTokensListFooterProps) => (
  <AddressTokensListFooterStyled>
    <AddressHiddenTokensButton addressHash={addressHash} onPress={onHiddenTokensButtonPress} />
    <AddressUknownTokensButton addressHash={addressHash} />
  </AddressTokensListFooterStyled>
)

export default AddressTokensListFooter

type AddressHiddenTokensButtonProps = Pick<AddressTokensListFooterProps, 'addressHash'> & ButtonProps

const AddressHiddenTokensButton = ({ addressHash, ...props }: AddressHiddenTokensButtonProps) => {
  const { data: hiddenTokenIds } = useFetchAddressHiddenTokens(addressHash)

  if (!hiddenTokenIds?.length) return null

  return <HiddenTokensButton tokensCount={hiddenTokenIds.length} {...props} />
}

const AddressUknownTokensButton = ({ addressHash }: AddressTokensListFooterProps) => {
  const {
    data: { nstIds }
  } = useFetchAddressTokensByType(addressHash)

  if (!nstIds?.length) return null

  return <UnknownTokensButton tokensCount={nstIds.length} addressHash={addressHash} />
}

const AddressTokensListFooterStyled = styled.View`
  margin-bottom: ${VERTICAL_GAP}px;
`
