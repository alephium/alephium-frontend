import { AssetAmount } from '@alephium/shared'
import { useFetchTokensAmountsWorth } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import Amount from '~/components/Amount'
import Row from '~/components/Row'

interface TotalWorthRowProps {
  assetAmounts: AssetAmount[]
}

const TotalWorthRow = ({ assetAmounts }: TotalWorthRowProps) => {
  const { t } = useTranslation()

  const { data: totalWorth } = useFetchTokensAmountsWorth(assetAmounts)

  if (!totalWorth) return null

  return (
    <Row title={t('Worth')} titleColor="secondary">
      <Amount value={totalWorth} isFiat bold />
    </Row>
  )
}

export default TotalWorthRow
