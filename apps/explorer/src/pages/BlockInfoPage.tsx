/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { getHumanReadableError } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightLine } from 'react-icons/ri'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import client from '@/api/client'
import Badge from '@/components/Badge'
import InlineErrorMessage from '@/components/InlineErrorMessage'
import { AddressLink, TightLink } from '@/components/Links'
import PageSwitch from '@/components/PageSwitch'
import Section from '@/components/Section'
import SectionTitle, { SecondaryTitle } from '@/components/SectionTitle'
import HighlightedCell from '@/components/Table/HighlightedCell'
import Table, { TDStyle } from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import usePageNumber from '@/hooks/usePageNumber'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import transactionIcon from '@/images/transaction-icon.svg'

type ParamTypes = {
  id: string
}

const BlockInfoPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<ParamTypes>()
  const navigate = useNavigate()

  const [blockInfo, setBlockInfo] = useState<explorer.BlockEntryLite>()
  const [blockInfoError, setBlockInfoError] = useState<{
    message: string
  }>()
  const [txList, setTxList] = useState<explorer.Transaction[]>()

  const [infoLoading, setInfoLoading] = useState(true)
  const [txLoading, setTxLoading] = useState(true)

  const currentPageNumber = usePageNumber()

  // Block info
  useEffect(() => {
    const fetchBlockInfo = async () => {
      if (!id) return

      setInfoLoading(true)
      try {
        const data = await client.explorer.blocks.getBlocksBlockHash(id)
        if (data) setBlockInfo(data)
      } catch (e) {
        console.error(e)

        setBlockInfoError({
          message: getHumanReadableError(e, 'Unknown error')
        })
      }
      setInfoLoading(false)
    }

    fetchBlockInfo()
  }, [id])

  // Block transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!client || !id) return
      setTxLoading(true)
      try {
        const data = await client.explorer.blocks.getBlocksBlockHashTransactions(id, {
          page: currentPageNumber
        })
        if (data) setTxList(data)
      } catch (e) {
        console.error(e)
      }
      setTxLoading(false)
    }

    fetchTransactions()
  }, [id, currentPageNumber])

  // If user entered an incorrect url (or did an incorrect search, try to see if a transaction exists with this hash)
  useEffect(() => {
    if (!client || !blockInfoError || !id) return

    const redirectToTransactionIfExists = async () => {
      try {
        const data = await client.explorer.transactions.getTransactionsTransactionHash(id)
        if (data) navigate(`/transactions/${id}`)
      } catch (error) {
        console.error(error)
      }
    }

    redirectToTransactionIfExists()
  }, [blockInfo, id, blockInfoError, navigate])

  return !infoLoading && !blockInfo && blockInfoError ? (
    <InlineErrorMessage {...blockInfoError} />
  ) : (
    <Section>
      <SectionTitle title={t('Block')} isLoading={infoLoading || txLoading} />

      <Table bodyOnly isLoading={infoLoading}>
        {blockInfo && (
          <TableBody tdStyles={BlockTableBodyCustomStyles}>
            <TableRow>
              <span>Hash</span>
              <HighlightedCell textToCopy={blockInfo.hash}>{blockInfo.hash}</HighlightedCell>
            </TableRow>
            <TableRow>
              <span>{t('Height')}</span>
              <span>{blockInfo.height}</span>
            </TableRow>
            <TableRow>
              <span>{t('Chain index')}</span>
              <span>
                {blockInfo.chainFrom} → {blockInfo.chainTo}
              </span>
            </TableRow>
            <TableRow>
              <span>{t('Nb. of transactions')}</span>
              <span>{blockInfo.txNumber}</span>
            </TableRow>
            <TableRow>
              <span>{t('Timestamp')}</span>
              <Timestamp timeInMs={blockInfo.timestamp} forceFormat="high" />
            </TableRow>
          </TableBody>
        )}
      </Table>

      {blockInfo?.mainChain ? (
        !txLoading && !txList ? (
          <InlineErrorMessage message={t('An error occured while fetching transactions')} />
        ) : (
          <>
            <SecondaryTitle>Transactions</SecondaryTitle>
            <Table main hasDetails scrollable isLoading={txLoading}>
              {txList && txList && (
                <>
                  <TableHeader
                    headerTitles={['', 'Hash', 'Inputs', '', 'Outputs', 'Total Amount', '']}
                    columnWidths={['35px', '150px', '120px', '50px', '120px', '90px', '30px']}
                    textAlign={['left', 'left', 'left', 'left', 'left', 'right', 'left']}
                  />
                  <TableBody tdStyles={TXTableBodyCustomStyles}>
                    {txList.map((t, i) => (
                      <TransactionRow transaction={t} key={i} />
                    ))}
                  </TableBody>
                </>
              )}
            </Table>
          </>
        )
      ) : (
        !txLoading && (
          <>
            <SecondaryTitle>Orphan block</SecondaryTitle>
            <div>It appears that this block is not part of the main chain.</div>
          </>
        )
      )}

      {txList && blockInfo?.txNumber !== undefined && blockInfo.txNumber > 0 && (
        <PageSwitch totalNumberOfElements={blockInfo.txNumber} />
      )}
    </Section>
  )
}

interface TransactionRowProps {
  transaction: explorer.Transaction
}

const TransactionRow: FC<TransactionRowProps> = ({ transaction }) => {
  const t = transaction
  const outputs = t.outputs as explorer.AssetOutput[]
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  const totalAmount = outputs?.reduce<bigint>((acc, o) => acc + BigInt(o.attoAlphAmount), BigInt(0))

  return (
    <>
      <TableRow key={t.hash} isActive={detailOpen} onClick={toggleDetail}>
        <TransactionIcon />
        <TightLink to={`/transactions/${t.hash}`} text={t.hash} maxWidth="150px" />
        <span>
          {t.inputs ? t.inputs.length : 0} {t.inputs && t.inputs.length === 1 ? 'address' : 'addresses'}
        </span>
        <RiArrowRightLine size={15} />
        <span>
          {outputs ? outputs.length : 0} {outputs?.length === 1 ? 'address' : 'addresses'}
        </span>
        <Badge type="neutralHighlight" amount={totalAmount} floatRight />

        <DetailToggle isOpen={detailOpen} />
      </TableRow>
      <TableDetailsRow openCondition={detailOpen}>
        <td />
        <td />
        <AnimatedCell>
          {t.inputs &&
            t.inputs.map(
              (input, i) =>
                input.address && (
                  <AddressLink key={i} address={input.address} txHashRef={input.txHashRef} maxWidth="180px" />
                )
            )}
        </AnimatedCell>
        <td />
        <AnimatedCell colSpan={3}>
          <IODetailList>
            {outputs?.map((o, i) => (
              <AddressLink
                address={o.address}
                key={i}
                maxWidth="180px"
                amounts={[{ id: ALPH.id, amount: BigInt(o.attoAlphAmount) }]}
                lockTime={o.lockTime}
                flex
              />
            ))}
          </IODetailList>
        </AnimatedCell>
      </TableDetailsRow>
    </>
  )
}

// TODO: make expandlable elements generic (in Table.tsx)

const BlockTableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 2,
    style: css`
      font-weight: 500;
    `
  }
]

const TXTableBodyCustomStyles: TDStyle[] = [
  {
    tdPos: 1,
    style: css`
      text-align: center;
      text-align: -webkit-center;
    `
  },
  {
    tdPos: 3,
    style: css`
      color: ${({ theme }) => theme.global.highlight};
    `
  },
  {
    tdPos: 4,
    style: css`
      text-align: center;
      color: ${({ theme }) => theme.font.secondary};
    `
  },
  {
    tdPos: 5,
    style: css`
      color: ${({ theme }) => theme.global.highlight};
    `
  }
]

export default BlockInfoPage

const TransactionIcon = styled.div`
  background-image: url(${transactionIcon});
  background-position: center;
  background-repeat: no-repeat;
  height: 20px;
  width: 20px;
`

const IODetailList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 9px;
  padding: 15px;
`
