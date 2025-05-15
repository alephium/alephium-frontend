import { AssetAmount } from '@alephium/shared'
import { useFetchFeeWorth, useFetchTokensAmountsWorth } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import Box, { BoxProps } from '@/components/Box'
import InfoRow from '@/features/send/InfoRow'

interface CheckWorthBoxProps extends BoxProps {
  assetAmounts: AssetAmount[]
  fee: bigint
}

const CheckWorthBox = ({ assetAmounts, fee, ...props }: CheckWorthBoxProps) => {
  const { t } = useTranslation()

  const { data: tokenAmountsWorth, isLoading } = useFetchTokensAmountsWorth(assetAmounts)
  const { data: feeWorth, isLoading: isLoadingFeeWorth } = useFetchFeeWorth(fee)

  const tooSmallFee = feeWorth < 0.01

  return (
    <Box {...props}>
      <InfoRowStyled label={t('Total worth')}>
        <Amounts>
          <AmountStyled tokenId={ALPH.id} value={tokenAmountsWorth} isFiat isLoading={isLoading} />
          <FeeRow>
            <FeeLabel>{t('Fee')}</FeeLabel>
            {tooSmallFee && ' < '}
            <AmountFee value={tooSmallFee ? 0.01 : feeWorth} isFiat isLoading={isLoadingFeeWorth} />
          </FeeRow>
        </Amounts>
      </InfoRowStyled>
    </Box>
  )
}

export default CheckWorthBox

const AmountStyled = styled(Amount)`
  color: ${({ theme }) => theme.font.primary};
  font-size: 20px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-1);
`

const AmountFee = styled(Amount)``

const FeeRow = styled.div`
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
  font-size: 11px;
`

const FeeLabel = styled.span``

const InfoRowStyled = styled(InfoRow)`
  align-items: center;
`
