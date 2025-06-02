import { useFetchAddressLatestTransaction } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import Timestamp from '@/components/Timestamp'
import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressLatestActivityProps {
  addressStr: string
}

const AddressLatestActivity = ({ addressStr }: AddressLatestActivityProps) => {
  const { t } = useTranslation()
  const { data, isLoading } = useFetchAddressLatestTransaction(addressStr)

  const timestamp = data?.latestTx?.timestamp

  return (
    <InfoGrid.Cell
      label={t('Latest activity')}
      value={
        timestamp ? <Timestamp timeInMs={timestamp} forceFormat="low" /> : !isLoading ? t('No activity yet') : undefined
      }
    />
  )
}

export default AddressLatestActivity
