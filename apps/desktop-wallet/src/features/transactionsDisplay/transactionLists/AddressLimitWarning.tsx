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

import InfoBox from '@/components/InfoBox'

const AddressLimitWarning = () => {
  const { t } = useTranslation()

  return (
    <InfoBox Icon={AlertTriangle} importance="warning">
      {t(
        'Your wallet has too many addresses. These are the transactions of the {{ maxNumber }} most frequently used addresses. Please, consider deleting some of them.',
        { maxNumber: ADDRESSES_QUERY_LIMIT }
      )}
    </InfoBox>
  )
}

export default AddressLimitWarning
