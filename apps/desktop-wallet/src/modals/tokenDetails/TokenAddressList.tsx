import styled from 'styled-components'

import { useFetchAddressesHashesWithBalance } from '@/hooks/useAddresses'
import { TokenDetailsModalProps } from '@/modals/tokenDetails/tokeDetailsTypes'
import AddressListRow from '@/pages/unlockedWallet/addressesPage/addressListRow/AddressListRow'

const TokenAddressesList = ({ tokenId }: TokenDetailsModalProps) => {
  const { data: addresses } = useFetchAddressesHashesWithBalance(tokenId)

  if (!addresses) return null

  return (
    <TableGrid>
      <TableGridContent>
        {addresses.map((addressHash) => (
          <AddressListRow addressHash={addressHash} tokenId={tokenId} key={addressHash} />
        ))}
      </TableGridContent>
    </TableGrid>
  )
}

export default TokenAddressesList

// TODO: DRY
const TableGrid = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-big);
`

// TODO: DRY
const TableGridContent = styled.div`
  display: flex;
  flex-direction: column;
`
