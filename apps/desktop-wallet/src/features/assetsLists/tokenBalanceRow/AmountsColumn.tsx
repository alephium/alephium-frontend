import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import SkeletonLoader from '@/components/SkeletonLoader'
import TableCellAmount from '@/components/TableCellAmount'
import { TokenId } from '@/types/tokens'

interface AmountsColumnProps {
  isLoading: boolean
  tokenId: TokenId
  children: ReactNode
  totalBalance?: bigint
  availableBalance?: bigint
}

const AmountsColumn = ({ isLoading, totalBalance, availableBalance, children, tokenId }: AmountsColumnProps) => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <TableCellAmount>
      {isLoading ? (
        <SkeletonLoader height="20px" width="30%" />
      ) : (
        <>
          {totalBalance && <Amount tokenId={tokenId} value={totalBalance} />}

          {availableBalance !== totalBalance && availableBalance !== undefined && (
            <AmountSubtitle>
              {`${t('Available')}: `}
              <Amount tokenId={tokenId} value={availableBalance} color={theme.font.tertiary} overrideSuffixColor />
            </AmountSubtitle>
          )}
        </>
      )}

      {children}
    </TableCellAmount>
  )
}

export const RawAmountSubtitle = () => {
  const { t } = useTranslation()

  return <AmountSubtitle>{t('Raw amount')}</AmountSubtitle>
}

export default AmountsColumn

const AmountSubtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 10px;
`
