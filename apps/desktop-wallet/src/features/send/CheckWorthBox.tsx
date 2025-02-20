import { AssetAmount, calculateAmountWorth } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { isNumber } from 'lodash'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import useFetchTokenPrices from '@/api/apiDataHooks/market/useFetchTokenPrices'
import useFetchTokensSeparatedByType from '@/api/apiDataHooks/utils/useFetchTokensSeparatedByType'
import Amount from '@/components/Amount'
import Box, { BoxProps } from '@/components/Box'
import InfoRow from '@/features/send/InfoRow'

interface CheckWorthBoxProps extends BoxProps {
  assetAmounts: AssetAmount[]
}

const CheckWorthBox = ({ assetAmounts, ...props }: CheckWorthBoxProps) => {
  const { t } = useTranslation()

  const {
    data: { listedFts },
    isLoading: isLoadingTokensByType
  } = useFetchTokensSeparatedByType(assetAmounts)

  const { data: tokenPrices, isLoading: isLoadingTokenPrices } = useFetchTokenPrices()

  const totalWorth = listedFts.reduce((totalWorth, token) => {
    const tokenPrice = tokenPrices?.find(({ symbol }) => symbol === token.symbol)?.price
    const tokenAmount = assetAmounts.find((asset) => asset.id === token.id)?.amount
    const tokenWorth =
      isNumber(tokenPrice) && tokenAmount !== undefined
        ? calculateAmountWorth(tokenAmount, tokenPrice, token.decimals)
        : 0

    return totalWorth + tokenWorth
  }, 0)

  return (
    <Box {...props}>
      <InfoRow label={t('Total worth')}>
        <Amounts>
          <AmountStyled
            tokenId={ALPH.id}
            value={totalWorth}
            isFiat
            isLoading={isLoadingTokensByType || isLoadingTokenPrices}
          />
        </Amounts>
      </InfoRow>
    </Box>
  )
}

export default CheckWorthBox

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 18px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-2);
`
