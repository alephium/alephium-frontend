/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash } from '@alephium/shared'
import { Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchAddressLatestTransaction from '@/api/apiDataHooks/address/useFetchAddressLatestTransaction'

interface AddressListRowLastUsedProps {
  addressHash: AddressHash
}

const AddressLastActivity = ({ addressHash }: AddressListRowLastUsedProps) => {
  const { t } = useTranslation()
  const { data } = useFetchAddressLatestTransaction({ addressHash })

  return (
    <AddressListRowLastUsedStyled>
      {data?.latestTx ? <LastTransactionTimestamp timestamp={data.latestTx.timestamp} /> : t('Never used')}
    </AddressListRowLastUsedStyled>
  )
}

export default AddressLastActivity

const LastTransactionTimestamp = ({ timestamp }: Pick<Transaction, 'timestamp'>) => {
  const { t } = useTranslation()

  return `${t('Last activity')} ${dayjs(timestamp).fromNow()}`
}

const AddressListRowLastUsedStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`
