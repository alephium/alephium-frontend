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
