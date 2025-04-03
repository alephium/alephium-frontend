import { AddressHash } from '@alephium/shared'
import { useFetchAddressHiddenTokens, useFetchAddressTokensByType } from '@alephium/shared-react'
import styled from 'styled-components/native'

import HiddenTokensButton from '~/components/tokensLists/HiddenTokensButton'
import UnknownTokensButton from '~/components/tokensLists/UnknownTokensButton'
import { ModalInstance } from '~/features/modals/modalTypes'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface AddressTokensListFooterProps {
  addressHash: AddressHash
  parentModalId?: ModalInstance['id']
}

const AddressTokensListFooter = ({ addressHash, parentModalId }: AddressTokensListFooterProps) => (
  <AddressTokensListFooterStyled>
    <AddressHiddenTokensButton addressHash={addressHash} parentModalId={parentModalId} />
    <AddressUknownTokensButton addressHash={addressHash} />
  </AddressTokensListFooterStyled>
)

export default AddressTokensListFooter

const AddressHiddenTokensButton = ({ addressHash, parentModalId }: AddressTokensListFooterProps) => {
  const { data: hiddenTokenIds } = useFetchAddressHiddenTokens(addressHash)

  if (!hiddenTokenIds?.length) return null

  return <HiddenTokensButton tokensCount={hiddenTokenIds.length} parentModalId={parentModalId} />
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
