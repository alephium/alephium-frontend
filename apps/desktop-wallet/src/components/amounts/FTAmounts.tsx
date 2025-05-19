import { TokenId } from '@alephium/shared'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount, { TokenAmountProps } from '@/components/Amount'

export interface FTAmountsBaseProp {
  isLoading: boolean
  tokenId: TokenId
  totalBalance?: bigint
  availableBalance?: bigint
}

type FTAmountsProps = FTAmountsBaseProp & Omit<TokenAmountProps, 'value'>

const FTAmounts = ({ totalBalance, availableBalance, isLoading, ...props }: FTAmountsProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  return (
    <>
      {totalBalance !== undefined && <Amount value={totalBalance} semiBold isLoading={isLoading} {...props} />}

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
