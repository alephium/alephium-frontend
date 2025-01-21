import { AddressHash } from '@alephium/shared'
import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'

import AddressBadge from '~/components/AddressBadge'
import { AddressesTokensListFooter } from '~/components/AddressesTokensList'
import TokenListItem from '~/components/TokenListItem'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'
import { makeSelectAddressesKnownFungibleTokens } from '~/store/addressesSlice'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = withModal<AddressDetailsModalProps>(({ id, addressHash }) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash, true))

  return (
    <BottomModalFlashList
      modalId={id}
      title={<AddressBadge addressHash={addressHash} fontSize={16} />}
      flashListRender={(props) => (
        <FlashList
          data={knownFungibleTokens}
          estimatedItemSize={70}
          ListHeaderComponent={() => <AddressDetailsModalHeader addressHash={addressHash} parentModalId={id} />}
          ListFooterComponent={() => <AddressesTokensListFooter addressHash={addressHash} parentModalId={id} />}
          renderItem={({ item: entry, index }) => (
            <TokenListItem
              key={entry.id}
              asset={entry}
              hideSeparator={index === knownFungibleTokens.length - 1}
              addressHash={addressHash}
              parentModalId={id}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default AddressDetailsModal
