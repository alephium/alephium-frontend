import { useTranslation } from 'react-i18next'

import { TableCell, TableHeader } from '@/components/Table'

interface TokensBalancesHeaderProps {
  showAllocation?: boolean
}

const TokensBalancesHeader = ({ showAllocation }: TokensBalancesHeaderProps) => {
  const { t } = useTranslation()

  return (
    <TableHeader>
      <TableCell fixedWidth={50} />
      <TableCell>
        <span>{t('Token')}</span>
      </TableCell>
      <TableCell>
        <span>{t('Price')}</span>
      </TableCell>
      {showAllocation && (
        <TableCell fixedWidth={140}>
          <span>{t('Allocation')}</span>
        </TableCell>
      )}
      <TableCell align="right">
        <span>{t('Amount')}</span>
      </TableCell>
      <TableCell align="right">
        <span>{t('Value')}</span>
      </TableCell>
    </TableHeader>
  )
}

export default TokensBalancesHeader
