import { selectAddressByHash } from '@alephium/shared/store'
import { getBaseAddressStr } from '@alephium/shared/transactions'
import { AddressHash } from '@alephium/shared/types'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Badge from '@/components/Badge'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { makeSelectContactByAddress } from '@/storage/addresses/addressesSelectors'

interface AddToContactsButtonProps {
  addressHash: AddressHash
}

const AddToContactsButton = ({ addressHash }: AddToContactsButtonProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const baseAddressHash = getBaseAddressStr(addressHash)
  const address = useAppSelector((s) => selectAddressByHash(s, baseAddressHash))
  const selectContactByAddress = useMemo(() => makeSelectContactByAddress(), [])
  const contact = useAppSelector((s) => selectContactByAddress(s, baseAddressHash))

  if (address || contact) return null

  const openContactFormModal = () =>
    dispatch(openModal({ name: 'ContactFormModal', props: { addressHash: baseAddressHash } }))

  return (
    <AddToContactsBadge clickable short>
      <ActionLink Icon={Plus} iconPosition="left" onClick={openContactFormModal}>
        {t('Add to contacts')}
      </ActionLink>
    </AddToContactsBadge>
  )
}

export default AddToContactsButton

// Translations of this label are far longer than the English one and would overflow the toast
const AddToContactsBadge = styled(Badge)`
  max-width: 100%;
  height: auto;
  min-height: 25px;
  padding-top: 3px;
  padding-bottom: 3px;
  white-space: normal;

  // Toasts stroke every nested svg with their status color, at a specificity this must outrank
  &&& svg {
    stroke: currentColor;
  }
`
