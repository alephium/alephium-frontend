import { AddressHash } from '@alephium/shared'
import { useFetchAddressLatestTransaction } from '@alephium/shared-react'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import AppText from '~/components/AppText'
import Row from '~/components/Row'

interface AddressListRowLastUsedProps {
  addressHash: AddressHash
}

const AddressLastActivity = ({ addressHash }: AddressListRowLastUsedProps) => {
  const { t } = useTranslation()
  const { data } = useFetchAddressLatestTransaction(addressHash)

  return (
    <Row title={t('Last activity')} isLast short>
      <AppText>{data?.latestTx ? dayjs(data.latestTx.timestamp).fromNow() : t('Never used')}</AppText>
    </Row>
  )
}

export default AddressLastActivity
