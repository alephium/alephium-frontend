import { AddressHash, formatRelativeTime } from '@alephium/shared'
import { useFetchAddressLatestTransaction } from '@alephium/shared-react'
import { explorer as e } from '@alephium/web3'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

interface AddressListRowLastUsedProps {
  addressHash: AddressHash
}

const AddressLastActivity = ({ addressHash }: AddressListRowLastUsedProps) => {
  const { t } = useTranslation()
  const { data } = useFetchAddressLatestTransaction(addressHash)

  return (
    <AddressListRowLastUsedStyled>
      {data?.latestTx ? <LastTransactionTimestamp timestamp={data.latestTx.timestamp} /> : t('Never used')}
    </AddressListRowLastUsedStyled>
  )
}

export default AddressLastActivity

const LastTransactionTimestamp = ({ timestamp }: Pick<e.Transaction, 'timestamp'>) => {
  const { t } = useTranslation()

  return `${t('Last activity')} ${formatRelativeTime(timestamp)}`
}

const AddressListRowLastUsedStyled = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  font-size: 11px;
`
