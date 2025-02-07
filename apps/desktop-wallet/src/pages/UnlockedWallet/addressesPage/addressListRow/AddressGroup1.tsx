import { AddressHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppSelector } from '@/hooks/redux'
import { selectAddressByHash } from '@/storage/addresses/addressesSelectors'

interface AddressListRowGroupProps {
  addressHash: AddressHash
}

const AddressGroup = ({ addressHash }: AddressListRowGroupProps) => {
  const { t } = useTranslation()
  const address = useAppSelector((s) => selectAddressByHash(s, addressHash))

  if (!address) return null

  return (
    <AddressListRowGroupStyled>
      {t('Group')} {address.group}
    </AddressListRowGroupStyled>
  )
}

export default AddressGroup

const AddressListRowGroupStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`
