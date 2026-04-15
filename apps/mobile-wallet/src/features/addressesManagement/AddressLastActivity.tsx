import { AddressHash, formatRelativeTime } from '@alephium/shared'
import { useFetchAddressLatestTransaction } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Row from '~/components/Row'

interface AddressListRowLastUsedProps {
  addressHash: AddressHash
}

const AddressLastActivity = ({ addressHash }: AddressListRowLastUsedProps) => {
  const { t, i18n } = useTranslation()
  const { data } = useFetchAddressLatestTransaction(addressHash)

  return (
    <Row title={t('Last activity')} isLast short>
      <AppText>{data?.latestTx ? formatRelativeTime(data.latestTx.timestamp, i18n.language) : t('Never used')}</AppText>
    </Row>
  )
}

export default AddressLastActivity
