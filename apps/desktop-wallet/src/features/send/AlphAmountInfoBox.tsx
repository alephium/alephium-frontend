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

import { formatAmountForDisplay } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import AlefSymbol from '@/components/AlefSymbol'
import InfoBox, { InfoBoxProps } from '@/components/InfoBox'

interface AlphAmountInfoBoxProps extends InfoBoxProps {
  amount: bigint
  label?: string
  fullPrecision?: boolean
}

const AlphAmountInfoBox = ({ amount, label, fullPrecision = false, ...props }: AlphAmountInfoBoxProps) => {
  const { t } = useTranslation()

  return (
    <InfoBox label={label ?? t('Amount')} {...props}>
      <Amount>
        {formatAmountForDisplay({ amount, fullPrecision, displayDecimals: !fullPrecision ? 7 : undefined })}{' '}
        <AlefSymbol />
      </Amount>
    </InfoBox>
  )
}

export default AlphAmountInfoBox

const Amount = styled.div`
  display: flex;
`
