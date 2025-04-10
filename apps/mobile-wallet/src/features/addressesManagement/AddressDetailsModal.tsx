import { AddressHash } from '@alephium/shared'
import { useFetchAddressBalances, useFetchAddressFtsSorted } from '@alephium/shared-react'
import { FlashList } from '@shopify/flash-list'

import AddressBadge from '~/components/AddressBadge'
import EmptyTokensListPlaceholders from '~/components/tokensLists/EmptyTokensListPlaceholder'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import AddressFtListItem from '~/features/addressesManagement/AddressFtListItem'
import AddressTokensListFooter from '~/features/addressesManagement/AddressTokensListFooter'
import BottomModalFlashList, { FlashListRenderProps } from '~/features/modals/BottomModalFlashList'
import { ModalInstance } from '~/features/modals/modalTypes'
import withModal from '~/features/modals/withModal'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => (
  <BottomModalFlashList
    modalId={id}
    title={<AddressBadge addressHash={addressHash} fontSize={17} />}
    flashListRender={(props) => <AddressFtsFlashList addressHash={addressHash} parentModalId={id} {...props} />}
  />
))

export default AddressDetailsModal

interface AddressFtsListProps extends FlashListRenderProps {
  addressHash: AddressHash
  parentModalId: ModalInstance['id']
}

const AddressFtsFlashList = ({ addressHash, parentModalId, ...props }: AddressFtsListProps) => {
  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)

  return (
    <FlashList
      data={sortedFts}
      estimatedItemSize={70}
      ListHeaderComponent={() => <AddressDetailsModalHeader addressHash={addressHash} parentModalId={parentModalId} />}
      ListFooterComponent={() => <AddressTokensListFooter addressHash={addressHash} parentModalId={parentModalId} />}
      ListEmptyComponent={() => <AddressesTokensListEmpty addressHash={addressHash} />}
      renderItem={({ item: { id }, index }) => (
        <AddressFtListItem
          key={id}
          tokenId={id}
          hideSeparator={index === sortedFts.length - 1}
          addressHash={addressHash}
          parentModalId={parentModalId}
        />
      )}
      {...props}
    />
  )
}

const AddressesTokensListEmpty = ({ addressHash }: { addressHash: AddressHash }) => {
  const { data: addressTokens, isLoading: isLoadingAddressTokens } = useFetchAddressBalances(addressHash)

  return <EmptyTokensListPlaceholders isLoading={isLoadingAddressTokens} isEmpty={addressTokens?.length === 0} />
}
