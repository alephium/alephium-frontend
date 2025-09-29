import { AddressHash, selectAddressGroup } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAppSelector } from '@/hooks/redux'

interface AddressListRowGroupProps {
  addressHash: AddressHash
}

const AddressGroup = ({ addressHash }: AddressListRowGroupProps) => {
  const { t } = useTranslation()
  const addressGroup = useAppSelector((s) => selectAddressGroup(s, addressHash))

  if (addressGroup === undefined) return null

  return (
    <AddressListRowGroupStyled>
      {t('Group')} {addressGroup}
    </AddressListRowGroupStyled>
  )
}

export default AddressGroup

const AddressListRowGroupStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`
