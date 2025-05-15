import { AddressHash } from '@alephium/shared'
import { useFetchAddressBalances, useFetchAddressFtsSorted } from '@alephium/shared-react'

import AddressBadge from '~/components/AddressBadge'
import EmptyTokensListPlaceholders from '~/components/tokensLists/EmptyTokensListPlaceholder'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import AddressFtListItem from '~/features/addressesManagement/AddressFtListItem'
import AddressTokensListFooter from '~/features/addressesManagement/AddressTokensListFooter'
import BottomModal2 from '~/features/modals/BottomModal2'
import withModal from '~/features/modals/withModal'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => {
  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)

  return (
    <BottomModal2
      modalId={id}
      title={<AddressBadge addressHash={addressHash} fontSize={17} />}
      flashListProps={{
        data: sortedFts,
        estimatedItemSize: 70,
        ListHeaderComponent: () => <AddressDetailsModalHeader addressHash={addressHash} parentModalId={id} />,
        ListFooterComponent: () => <AddressTokensListFooter addressHash={addressHash} parentModalId={id} />,
        ListEmptyComponent: () => <AddressesTokensListEmpty addressHash={addressHash} />,
        renderItem: ({ item: { id: itemId }, index }) => (
          <AddressFtListItem
            key={itemId}
            tokenId={itemId}
            hideSeparator={index === sortedFts.length - 1}
            addressHash={addressHash}
            parentModalId={id}
          />
        )
      }}
    />
  )
})

export default AddressDetailsModal

const AddressesTokensListEmpty = ({ addressHash }: { addressHash: AddressHash }) => {
  const { data: addressTokens, isLoading: isLoadingAddressTokens } = useFetchAddressBalances(addressHash)

  return <EmptyTokensListPlaceholders isLoading={isLoadingAddressTokens} isEmpty={addressTokens?.length === 0} />
}
