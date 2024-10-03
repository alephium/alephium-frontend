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

import { ADDRESSES_QUERY_LIMIT } from '@alephium/shared'
import { AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Button from '@/components/Button'
import InfoBox from '@/components/InfoBox'
import { openModal } from '@/features/modals/modalActions'
import { useAppDispatch } from '@/hooks/redux'

const AddressLimitWarning = () => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const handleForgetAddressesClick = () => dispatch(openModal({ name: 'DeleteAddressesModal' }))

  return (
    <InfoBox Icon={AlertTriangle} importance="warning">
      <Contents>
        <span>
          {t(
            'Your wallet has too many addresses. These are the transactions of the {{ maxNumber }} most frequently used addresses. Please, consider removing some of them.',
            { maxNumber: ADDRESSES_QUERY_LIMIT }
          )}
        </span>
        <Button short onClick={handleForgetAddressesClick}>
          {t('Forget addresses')}
        </Button>
      </Contents>
    </InfoBox>
  )
}

export default AddressLimitWarning

const Contents = styled.div`
  display: flex;
  gap: 30px;
  justify-content: space-between;
  align-items: center;
`
