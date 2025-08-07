import { useFetchTransactionTokens } from '@alephium/shared-react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import DataList from '@/components/DataList'
import HashEllipsed from '@/components/HashEllipsed'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'

const NSTsDataListRow = ({ tx, referenceAddress }: TransactionDetailsModalTxProps) => {
  const {
    data: { nsts }
  } = useFetchTransactionTokens(tx, referenceAddress)
  const { t } = useTranslation()

  if (nsts.length === 0) return null

  return (
    <DataList.Row label={t('Unknown tokens')}>
      <Amounts>
        {nsts.map(({ id, amount }) => (
          <AmountContainer key={id}>
            <Amount tokenId={id} tabIndex={0} value={amount} highlight />
            <TokenHash hash={id} />
          </AmountContainer>
        ))}
      </Amounts>
    </DataList.Row>
  )
}

export default NSTsDataListRow

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
`

const TokenHash = styled(HashEllipsed)`
  max-width: 80px;
  color: ${({ theme }) => theme.font.primary};
`
