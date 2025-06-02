import { addApostrophes } from '@alephium/shared'
import { useFetchAddressTransactionsCount } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressTransactionsCountProps {
  addressStr: string
}

const AddressTransactionsCount = ({ addressStr }: AddressTransactionsCountProps) => {
  const { t } = useTranslation()

  const { data: txNumber, isLoading } = useFetchAddressTransactionsCount(addressStr)

  return (
    <InfoGrid.Cell
      label={t('Nb. of transactions')}
      value={txNumber ? addApostrophes(txNumber.toFixed(0)) : !isLoading ? 0 : undefined}
    />
  )
}

export default AddressTransactionsCount
