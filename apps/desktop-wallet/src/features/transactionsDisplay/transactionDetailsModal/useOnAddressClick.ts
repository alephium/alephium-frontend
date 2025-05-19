import { AddressHash } from '@alephium/shared'
import { useUnsortedAddressesHashes } from '@alephium/shared-react'

import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { openInWebBrowser } from '@/utils/misc'

const useOnAddressClick = () => {
  const explorerUrl = useAppSelector((state) => state.network.settings.explorerUrl)
  const internalAddressHashes = useUnsortedAddressesHashes()

  const dispatch = useAppDispatch()

  const onShowAddress = (addressHash: AddressHash) =>
    internalAddressHashes.includes(addressHash)
      ? dispatch(openModal({ name: 'AddressDetailsModal', props: { addressHash } }))
      : openInWebBrowser(`${explorerUrl}/addresses/${addressHash}`)

  return onShowAddress
}

export default useOnAddressClick
