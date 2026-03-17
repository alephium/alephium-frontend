import { AddressHash } from '@alephium/shared'
import {
  useAddressExplorerLink,
  useFetchAddressBalances,
  useFetchAddressFtsSorted,
  useFetchAddressNfts
} from '@alephium/shared-react'
import { FlashListProps } from '@shopify/flash-list'
import { openBrowserAsync } from 'expo-web-browser'
import { memo, useCallback, useMemo, useState } from 'react'

import AddressBadge from '~/components/AddressBadge'
import Button from '~/components/buttons/Button'
import EmptyTokensListPlaceholders from '~/components/tokensLists/EmptyTokensListPlaceholder'
import AddressDetailsModalHeader from '~/features/addressesManagement/AddressDetailsModalHeader'
import AddressFtListItem from '~/features/addressesManagement/AddressFtListItem'
import AddressTokensListFooter from '~/features/addressesManagement/AddressTokensListFooter'
import useNftsGridFlashListProps from '~/features/assetsDisplay/nftsDisplay/useNftsGridFlashListProps'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'

export interface AddressDetailsModalProps {
  addressHash: AddressHash
}

const AddressDetailsModal = memo<AddressDetailsModalProps>(({ addressHash }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [hasAccessedNfts, setHasAccessedNfts] = useState(false)

  const handleTabChange = useCallback((tabIndex: number) => {
    setActiveTab(tabIndex)
    if (tabIndex === 1) setHasAccessedNfts(true)
  }, [])

  const { data: sortedFts } = useFetchAddressFtsSorted(addressHash)
  const { data: nfts, isLoading: isNftsLoading } = useFetchAddressNfts(
    hasAccessedNfts ? addressHash : (undefined as unknown as AddressHash)
  )

  const { dismissModal } = useModalContext()

  const tokensFlashListProps = useMemo(
    () => ({
      data: sortedFts,
      estimatedItemSize: 70,
      ListFooterComponent: () => (
        <AddressTokensListFooter addressHash={addressHash} onHiddenTokensButtonPress={dismissModal} />
      ),
      ListEmptyComponent: () => <AddressesTokensListEmpty addressHash={addressHash} />,
      renderItem: ({ item, index }: { item: unknown; index: number }) => {
        const { id: itemId } = item as { id: string }
        return (
          <AddressFtListItem
            key={itemId}
            tokenId={itemId}
            hideSeparator={index === sortedFts.length - 1}
            addressHash={addressHash}
            onTokenDetailsModalClose={dismissModal}
          />
        )
      }
    }),
    [sortedFts, addressHash, dismissModal]
  )

  const nftsFlashListProps = useNftsGridFlashListProps({
    nfts,
    isLoading: isNftsLoading,
    estimatedItemSize: 64
  })

  // We combine the active list props with the mandatory header component.
  const activeFlashListProps = (activeTab === 0 ? tokensFlashListProps : nftsFlashListProps) as FlashListProps<unknown>

  const listHeaderElement = useMemo(
    () => (
      <AddressDetailsModalHeader
        addressHash={addressHash}
        onForgetAddress={dismissModal}
        onSendPress={dismissModal}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />
    ),
    [addressHash, dismissModal, activeTab, handleTabChange]
  )

  const flashListProps = useMemo(
    () => ({
      ...activeFlashListProps,
      ListHeaderComponent: listHeaderElement
    }),
    [activeFlashListProps, listHeaderElement]
  )

  return (
    <BottomModal2
      title={<AddressBadge addressHash={addressHash} fontSize={17} />}
      titleButton={<AddressExplorerButton addressHash={addressHash} />}
      bottomSheetModalProps={{ enableDynamicSizing: false, snapPoints: ['50%', '100%'] }}
      flashListProps={flashListProps}
    />
  )
})

export default AddressDetailsModal

const AddressExplorerButton = ({ addressHash }: { addressHash: AddressHash }) => {
  const addressExplorerUrl = useAddressExplorerLink(addressHash)

  return (
    <Button iconProps={{ name: 'open-outline' }} onPress={() => openBrowserAsync(addressExplorerUrl)} compact squared />
  )
}

const AddressesTokensListEmpty = ({ addressHash }: { addressHash: AddressHash }) => {
  const { data: addressTokens, isLoading: isLoadingAddressTokens } = useFetchAddressBalances(addressHash)

  return <EmptyTokensListPlaceholders isLoading={isLoadingAddressTokens} isEmpty={addressTokens?.length === 0} />
}
