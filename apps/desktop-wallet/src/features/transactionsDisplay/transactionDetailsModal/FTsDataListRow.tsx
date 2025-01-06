import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Amount from '@/components/Amount'
import DataList from '@/components/DataList'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useFetchTransactionTokens from '@/features/transactionsDisplay/useFetchTransactionTokens'
import useTransactionInfoType from '@/features/transactionsDisplay/useTransactionInfoType'

const FTsDataListRow = ({ tx, refAddressHash }: TransactionDetailsModalTxProps) => {
  const {
    data: { fungibleTokens }
  } = useFetchTransactionTokens(tx, refAddressHash)
  const infoType = useTransactionInfoType(tx, refAddressHash)
  const { t } = useTranslation()

  const isMoved = infoType === 'move'

  return (
    <DataList.Row label={t('Total value')}>
      <Amounts>
        {fungibleTokens.map(({ id, amount }) => (
          <AmountContainer key={id}>
            <Amount
              tokenId={id}
              tabIndex={0}
              value={amount}
              fullPrecision
              highlight={!isMoved}
              showPlusMinus={!isMoved}
            />
          </AmountContainer>
        ))}
      </Amounts>
    </DataList.Row>
  )
}

export default FTsDataListRow

const AmountContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`

const Amounts = styled.div`
  display: flex;
  flex-direction: column;
`
