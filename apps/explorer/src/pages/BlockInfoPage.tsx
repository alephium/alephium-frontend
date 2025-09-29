import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightLine } from 'react-icons/ri'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { blocksQueries } from '@/api/blocks/blocksApi'
import client from '@/api/client'
import { transactionsQueries } from '@/api/transactions/transactionsApi'
import Badge from '@/components/Badge'
import FailedTXBubble from '@/components/FailedTXBubble'
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

  const currentPageNumber = usePageNumber()

  const {
    data: blockInfo,
    error: blockInfoError,
    isPending: isBlockInfoPending
  } = useQuery({ ...blocksQueries.block.one(id || ''), enabled: !!id })

  const { data: txList, isPending: isTxListPending } = useQuery({
    ...blocksQueries.block.transactions(id || '', currentPageNumber),
    enabled: !!id
  })

  const { data: uncleBlock } = useQuery({
    ...blocksQueries.block.uncle(id || ''),
    enabled: !!blockInfo && blockInfo.mainChain === false
  })

  const { data: txInfo } = useQuery({
    ...transactionsQueries.transaction.one(id || ''),
    enabled: !!id && !!blockInfoError
  })

  // If user entered an incorrect url (or did an incorrect search, try to see if a transaction exists with this hash)
  useEffect(() => {
    if (!client || !blockInfoError || !id) return

    const redirectToTransactionIfExists = async () => {
      if (txInfo) navigate(`/transactions/${id}`)
    }

    redirectToTransactionIfExists()
  }, [blockInfo, id, blockInfoError, navigate, txInfo])

  const isMainChainBlock = blockInfo?.mainChain
  const isUncleBlock = !isBlockInfoPending && !isMainChainBlock && !!uncleBlock
  const isOrphanBlock = !isBlockInfoPending && !isMainChainBlock && !isUncleBlock

  return !isBlockInfoPending && !blockInfo && blockInfoError ? (
    <InlineErrorMessage {...blockInfoError} />
  ) : (
    <Section>
      <SectionTitle
        title={t('Block')}
        badge={isUncleBlock ? t('Uncle') : isOrphanBlock ? t('Orphan') : undefined}
        isLoading={isBlockInfoPending || isTxListPending}
      />
      <Table bodyOnly noBorder isLoading={isBlockInfoPending}>
        {blockInfo && (
          <TableBody tdStyles={BlockTableBodyCustomStyles}>
            <TableRow>
              <span>{t('Hash')}</span>
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
            {blockInfo.ghostUncles && blockInfo.ghostUncles.length > 0 && (
              <TableRow>
                <span>{t('uncleBlock_other')}</span>
                <UncleBlocks>
                  {blockInfo.ghostUncles?.map((b) => (
                    <TightLink text={b.blockHash} to={`/blocks/${b.blockHash}`} maxWidth="300px" key={b.blockHash} />
                  ))}
                </UncleBlocks>
              </TableRow>
            )}
          </TableBody>
        )}
      </Table>

      <SecondaryTitle>{t('Transactions')}</SecondaryTitle>

      {isMainChainBlock ? (
        !isTxListPending && !txList ? (
          <InlineErrorMessage message={t('An error occured while fetching transactions')} />
        ) : (
          <Table noBorder main hasDetails scrollable isLoading={isTxListPending}>
            {txList && (
              <>
                <TableHeader
                  headerTitles={['', t('Hash'), t('Inputs'), '', t('Outputs'), t('Total Amount'), '']}
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
        )
      ) : (
        !isTxListPending && (
          <InlineErrorMessage message={t('It appears that this block is not part of the main chain.')} />
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
  const { t } = useTranslation()
  const { detailOpen, toggleDetail } = useTableDetailsState(false)

  const tx = transaction
  const outputs = tx.outputs as explorer.AssetOutput[]
  const isConflicted = transaction.conflicted
  const isScriptExecutionOk = transaction.scriptExecutionOk

  const totalAmount = outputs?.reduce<bigint>((acc, o) => acc + BigInt(o.attoAlphAmount), BigInt(0))

  return (
    <>
      <TableRow key={tx.hash} isActive={detailOpen} onClick={toggleDetail}>
        <TransactionIcon>
          {isConflicted && <FailedTXBubble tooltipContent={t('Conflicted transaction')}>x</FailedTXBubble>}
          {!isScriptExecutionOk && <FailedTXBubble tooltipContent={t('Script execution failed')}>!</FailedTXBubble>}
        </TransactionIcon>
        <TightLink to={`/transactions/${tx.hash}`} text={tx.hash} maxWidth="150px" />
        <span>
          {tx.inputs ? tx.inputs.length : 0} {tx.inputs && tx.inputs.length === 1 ? 'address' : 'addresses'}
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
        <AnimatedCell>
          {tx.inputs &&
            tx.inputs.map(
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
    style: css``
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
    style: css``
  }
]

export default BlockInfoPage

const TransactionIcon = styled.div`
  position: relative;
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
  border-radius: 6px;
  padding: 8px 10px;
`

const UncleBlocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`
