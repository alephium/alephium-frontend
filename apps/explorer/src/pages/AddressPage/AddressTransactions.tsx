import { useFetchAddressTransactionsCount } from '@alephium/shared-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { usePageVisibility } from 'react-page-visibility'
import styled, { css } from 'styled-components'

import { queries } from '@/api'
import TimestampExpandButton from '@/components/Buttons/TimestampExpandButton'
import PageSwitch from '@/components/PageSwitch'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableHeader from '@/components/Table/TableHeader'
import usePageNumber from '@/hooks/usePageNumber'
import AddressTransactionRow from '@/pages/AddressInfoPage/AddressTransactionRow'
import useIsContract from '@/pages/AddressPage/useIsContract'

export const numberOfTxsPerPage = 10

interface AddressTransactionsProps {
  addressStr: string
}

const AddressTransactions = ({ addressStr }: AddressTransactionsProps) => {
  const { t } = useTranslation()
  const isAppVisible = usePageVisibility()
  const pageNumber = usePageNumber()
  const isContract = useIsContract(addressStr)

  const { data: txNumber } = useFetchAddressTransactionsCount(addressStr)

  const refetchInterval = isAppVisible && pageNumber === 1 ? 10000 : undefined

  const { data: txList, isLoading: txListLoading } = useQuery({
    ...queries.address.transactions.confirmed(addressStr, pageNumber, numberOfTxsPerPage),
    refetchInterval,
    placeholderData: keepPreviousData
  })

  const { data: addressMempoolTransactions = [] } = useQuery({
    ...queries.address.transactions.mempool(addressStr),
    refetchInterval
  })

  return (
    <>
      <Table hasDetails main scrollable isLoading={txListLoading}>
        {(!txListLoading && txList?.length) || addressMempoolTransactions?.length ? (
          <>
            <TableHeader
              headerTitles={[
                <span key="hash-time">
                  {t('Hash & Time')}
                  <TimestampExpandButton />
                </span>,
                t('Type'),
                t('Assets'),
                '',
                t('Addresses_other'),
                t('Amounts'),
                ''
              ]}
              columnWidths={['20%', '25%', '20%', '80px', '25%', '150px', '30px']}
              textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
            />
            <TableBody tdStyles={TxListCustomStyles}>
              {addressMempoolTransactions &&
                addressMempoolTransactions.map((t, i) => (
                  <AddressTransactionRow transaction={t} addressHash={addressStr} key={i} isInContract={isContract} />
                ))}
              {txList &&
                txList
                  .sort((t1, t2) => (t2.timestamp && t1.timestamp ? t2.timestamp - t1.timestamp : 1))
                  .map((t, i) => (
                    <AddressTransactionRow transaction={t} addressHash={addressStr} key={i} isInContract={isContract} />
                  ))}
            </TableBody>
          </>
        ) : (
          <TableBody>
            <NoTxsMessage>
              <td>{t('No transactions yet')}</td>
            </NoTxsMessage>
          </TableBody>
        )}
      </Table>
      {txNumber ? <PageSwitch totalNumberOfElements={txNumber} elementsPerPage={numberOfTxsPerPage} /> : null}
    </>
  )
}

export default AddressTransactions

const NoTxsMessage = styled.tr`
  color: ${({ theme }) => theme.font.secondary};
  background-color: ${({ theme }) => theme.bg.secondary};
  padding: 15px 20px;
`

const TxListCustomStyles: TDStyle[] = [
  {
    tdPos: 3,
    style: css`
      min-width: 100px;
    `
  },
  {
    tdPos: 6,
    style: css`
      text-align: right;
    `
  },
  {
    tdPos: 7,
    style: css`
      padding: 0;
    `
  }
]
