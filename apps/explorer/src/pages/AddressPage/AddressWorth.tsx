import { useFetchAddressWorth } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import client from '@/api/client'
import Amount from '@/components/Amount'
import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressWorthProps {
  addressStr: string
}

const AddressWorth = ({ addressStr }: AddressWorthProps) => {
  const { t } = useTranslation()
  const { data: addressWorth } = useFetchAddressWorth(addressStr)

  return (
    <InfoGrid.Cell
      label={t('Address worth')}
      value={addressWorth && <Amount value={addressWorth} isFiat suffix="$" />}
      sublabel={client.networkType === 'testnet' && t('Worth of mainnet equivalent')}
    />
  )
}

export default AddressWorth
