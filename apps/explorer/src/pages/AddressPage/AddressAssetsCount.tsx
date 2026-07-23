import { useFetchAddressBalances } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressAssetsCountProps {
  addressStr: string
}

const AddressAssetsCount = ({ addressStr }: AddressAssetsCountProps) => {
  const { data, isLoading, isError } = useFetchAddressBalances(addressStr)
  const { t } = useTranslation()

  return <InfoGrid.Cell label={t('Nb. of assets')} value={isLoading ? undefined : isError ? '-' : data?.length ?? 0} />
}

export default AddressAssetsCount
