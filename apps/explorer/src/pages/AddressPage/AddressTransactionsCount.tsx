import { addApostrophes } from '@alephium/shared/numbers'
import { useFetchAddressTransactionsCount } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressTransactionsCountProps {
  addressStr: string
}

const AddressTransactionsCount = ({ addressStr }: AddressTransactionsCountProps) => {
  const { t } = useTranslation()

  const { data: txNumber, isLoading, isError } = useFetchAddressTransactionsCount(addressStr)

  return (
    <InfoGrid.Cell
      label={t('Nb. of transactions')}
      value={isLoading ? undefined : isError ? '-' : addApostrophes((txNumber ?? 0).toFixed(0))}
    />
  )
}

export default AddressTransactionsCount
