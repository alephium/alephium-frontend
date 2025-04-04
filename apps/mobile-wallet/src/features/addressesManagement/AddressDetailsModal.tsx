import { AddressHash } from '@alephium/shared'
import { useFetchAddressBalances, useFetchAddressFtsSorted } from '@alephium/shared-react'
import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'

import AddressBadge from '~/components/AddressBadge'
import EmptyTokensListPlaceholders from '~/components/tokensLists/EmptyTokensListPlaceholder'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import AddressFtListItem from '~/features/addressesManagement/AddressFtListItem'
import AddressTokensListFooter from '~/features/addressesManagement/AddressTokensListFooter'
import BottomModalBase from '~/features/modals/BottomModalBase'
import { FlashListRenderProps } from '~/features/modals/BottomModalFlashList'
import { ModalInstance } from '~/features/modals/modalTypes'
import { useBottomModalState } from '~/features/modals/useBottomModalState'
import withModal from '~/features/modals/withModal'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => {
  const modalState = useBottomModalState({
    modalId: id,
    navHeight: 50
  })

  return (
    <BottomModalBase modalId={id} title={<AddressBadge addressHash={addressHash} fontSize={17} />} {...modalState}>
      <AddressFtsFlashList
        addressHash={addressHash}
        parentModalId={id}
        onContentSizeChange={modalState.handleContentSizeChange}
        contentContainerStyle={{
          paddingHorizontal: DEFAULT_MARGIN,
          paddingBottom: VERTICAL_GAP
        }}
      />
    </BottomModalBase>
  )
})

export default AddressDetailsModal

interface AddressFtsListProps extends FlashListRenderProps {
  addressHash: AddressHash
  parentModalId: ModalInstance['id']
}

const AddressFtsFlashList = ({ addressHash, parentModalId, ...props }: AddressFtsListProps) => {
  const { listedFts, unlistedFts } = useFetchAddressFtsSorted(addressHash)

  const fts = useMemo(() => [...listedFts, ...unlistedFts], [listedFts, unlistedFts])

  return (
    <FlashList
      data={fts}
      estimatedItemSize={70}
      ListHeaderComponent={() => <AddressDetailsModalHeader addressHash={addressHash} parentModalId={parentModalId} />}
      ListFooterComponent={() => <AddressTokensListFooter addressHash={addressHash} parentModalId={parentModalId} />}
      ListEmptyComponent={() => <AddressesTokensListEmpty addressHash={addressHash} />}
      renderItem={({ item: { id }, index }) => (
        <AddressFtListItem
          key={id}
          tokenId={id}
          hideSeparator={index === fts.length - 1}
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
