import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import useFetchWalletSingleTokenBalances from '@/api/apiDataHooks/wallet/useFetchWalletSingleTokenBalances'
import Amount, { TokenAmountProps } from '@/components/Amount'

const FTAmounts = (props: Omit<TokenAmountProps, 'value'>) => {
  const { data: balances, isLoading } = useFetchWalletSingleTokenBalances({ tokenId: props.tokenId })
  const { t } = useTranslation()
  const theme = useTheme()

  const totalBalance = BigInt(balances.totalBalance)
  const availableBalance = BigInt(balances.availableBalance)

  return (
    <>
      {totalBalance && <Amount value={totalBalance} semiBold isLoading={isLoading} {...props} />}

      {availableBalance !== totalBalance && availableBalance !== undefined && (
        <AmountSubtitle>
          {`${t('Available')}: `}
          <Amount tokenId={props.tokenId} value={availableBalance} color={theme.font.tertiary} overrideSuffixColor />
        </AmountSubtitle>
      )}
    </>
  )
}

export default FTAmounts

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`
