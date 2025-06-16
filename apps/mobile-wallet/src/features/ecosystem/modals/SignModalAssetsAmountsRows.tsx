import { AssetAmount } from '@alephium/shared'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import Row from '~/components/Row'
import TotalWorthRow from '~/features/send/screens/TotalWorthRow'

interface SignModalAssetsAmountsRowsProps {
  assetAmounts: AssetAmount[]
}

const SignModalAssetsAmountsRows = memo(({ assetAmounts }: SignModalAssetsAmountsRowsProps) => {
  const { t } = useTranslation()

  if (assetAmounts.length === 0) return null

  return (
    <>
      <Row title={t('Sending')} titleColor="secondary">
        <AssetAmounts>
          {assetAmounts.map(({ id, amount }) =>
            amount ? <AssetAmountWithLogo key={id} assetId={id} amount={BigInt(amount)} /> : null
          )}
        </AssetAmounts>
      </Row>

      <TotalWorthRow assetAmounts={assetAmounts} />
    </>
  )
})

export default SignModalAssetsAmountsRows

const AssetAmounts = styled.View`
  gap: 5px;
  align-items: flex-end;
`
