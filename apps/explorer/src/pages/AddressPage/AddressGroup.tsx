import { selectAddressByHash } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import { useAppSelector } from '@/hooks/redux'
import InfoGrid from '@/pages/AddressInfoPage/InfoGrid'

interface AddressGroupProps {
  addressStr: string
}

const AddressGroup = ({ addressStr }: AddressGroupProps) => {
  const { t } = useTranslation()
  const addressGroup = useAppSelector((s) => selectAddressByHash(s, addressStr)?.group)

  if (addressGroup === undefined) return null

  return <InfoGrid.Cell label={t('Address group')} value={addressGroup} />
}

export default AddressGroup
