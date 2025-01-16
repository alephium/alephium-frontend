import { useTranslation } from 'react-i18next'

import { TableCell, TableHeader } from '@/components/Table'

const TokensBalancesHeader = () => {
  const { t } = useTranslation()

  return (
    <TableHeader>
      <TableCell fixedWidth={50} noBorder />
      <TableCell>
        <span>{t('Token')}</span>
      </TableCell>
      <TableCell>
        <span>{t('Price')}</span>
      </TableCell>
      <TableCell fixedWidth={140}>
        <span>{t('Allocation')}</span>
      </TableCell>
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
