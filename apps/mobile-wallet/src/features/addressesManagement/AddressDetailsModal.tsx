import { AddressHash } from '@alephium/shared'
import { useFetchAddressBalances, useFetchAddressFtsSorted } from '@alephium/shared-react'
import { memo } from 'react'

import AddressBadge from '~/components/AddressBadge'
import EmptyTokensListPlaceholders from '~/components/tokensLists/EmptyTokensListPlaceholder'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import AddressFtListItem from '~/features/addressesManagement/AddressFtListItem'
import AddressTokensListFooter from '~/features/addressesManagement/AddressTokensListFooter'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = memo<AddressDetailsModalProps>(({ addressHash }) => {
  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)
  const { dismissModal } = useModalContext()

  return (
    <BottomModal2
      title={<AddressBadge addressHash={addressHash} fontSize={17} />}
      flashListProps={{
        data: sortedFts,
        estimatedItemSize: 70,
        ListHeaderComponent: () => (
          <AddressDetailsModalHeader
            addressHash={addressHash}
            onForgetAddress={dismissModal}
            onSendPress={dismissModal}
          />
        ),
        ListFooterComponent: () => (
          <AddressTokensListFooter addressHash={addressHash} onHiddenTokensButtonPress={dismissModal} />
        ),
        ListEmptyComponent: () => <AddressesTokensListEmpty addressHash={addressHash} />,
        renderItem: ({ item: { id: itemId }, index }) => (
          <AddressFtListItem
            key={itemId}
            tokenId={itemId}
            hideSeparator={index === sortedFts.length - 1}
            addressHash={addressHash}
            onTokenDetailsModalClose={dismissModal}
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
