import { AddressHash } from '@alephium/shared'
import { FlashList } from '@shopify/flash-list'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import AddressBadge from '~/components/AddressBadge'
import { AddressesTokensListFooter } from '~/components/AddressesTokensList'
import AppText from '~/components/AppText'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import TokenListItem from '~/components/TokenListItem'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import withModal from '~/features/modals/withModal'
import { useAppSelector } from '~/hooks/redux'
import {
  makeSelectAddressesCheckedUnknownTokens,
  makeSelectAddressesKnownFungibleTokens,
  selectAddressHiddenAssetIds
} from '~/store/addresses/addressesSelectors'

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
          ListEmptyComponent={() => <AddressesTokensListEmpty addressHash={addressHash} />}
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

const AddressesTokensListEmpty = ({ addressHash }: { addressHash: AddressHash }) => {
  const selectAddressesKnownFungibleTokens = useMemo(makeSelectAddressesKnownFungibleTokens, [])
  const knownFungibleTokens = useAppSelector((s) => selectAddressesKnownFungibleTokens(s, addressHash, true))
  const selectAddressesCheckedUnknownTokens = useMemo(makeSelectAddressesCheckedUnknownTokens, [])
  const unknownTokens = useAppSelector(selectAddressesCheckedUnknownTokens)
  const hiddenAssetIds = useAppSelector((s) => selectAddressHiddenAssetIds(s, addressHash))
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const { t } = useTranslation()

  const hasHiddenTokens = hiddenAssetIds.length > 0
  const hasUnknownTokens = unknownTokens.length > 0

  if (addressesBalancesStatus === 'uninitialized')
    return (
      <EmptyPlaceholder>
        <AppText size={28}>⏳</AppText>
        <AppText>{t('Loading your balances...')}</AppText>
      </EmptyPlaceholder>
    )

  if (knownFungibleTokens.length === 0 && !hasUnknownTokens && !hasHiddenTokens)
    return (
      <EmptyPlaceholder>
        <AppText size={28}>👀</AppText>
        <AppText>{t('No assets here, yet.')}</AppText>
      </EmptyPlaceholder>
    )
}
