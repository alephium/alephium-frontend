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

import { MAX_API_RETRIES } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import {
  AcceptedTransaction,
  PendingTransaction,
  PerChainHeight,
  Transaction
} from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import _, { sortBy, uniq } from 'lodash'
import { useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCheckLine } from 'react-icons/ri'
import { usePageVisibility } from 'react-page-visibility'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { queries } from '@/api'
import { useAssetsMetadata } from '@/api/assets/assetsHooks'
import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import InlineErrorMessage from '@/components/InlineErrorMessage'
import { AddressLink, SimpleLink } from '@/components/Links'
import LoadingSpinner from '@/components/LoadingSpinner'
import Section from '@/components/Section'
import SectionTitle, { SecondaryTitle } from '@/components/SectionTitle'
import HighlightedCell from '@/components/Table/HighlightedCell'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import TransactionIOList from '@/components/TransactionIOList'
import { useSnackbar } from '@/hooks/useSnackbar'
import { AssetType } from '@/types/assets'
import { calculateIoAmountsDelta } from '@/utils/transactions'

type ParamTypes = {
  id: string
}

const TransactionInfoPage = () => {
  const { t } = useTranslation()
  const { id } = useParams<ParamTypes>()
  const isAppVisible = usePageVisibility()
  const { displaySnackbar } = useSnackbar()

  const previousTransactionData = useRef<Transaction | undefined>()
  const txInfoError = useRef<string | undefined>()

  let txInfoErrorStatus

  const {
    data: transactionData,
    error: transactionInfoError,
    isLoading: txInfoLoading
  } = useQuery({
    ...queries.transactions.transaction.one(id || ''),
    enabled: !!id,
    refetchInterval:
      isAppVisible &&
      (!previousTransactionData.current || !isConfirmedTx(previousTransactionData.current)) &&
      !txInfoError.current
        ? 10000
        : undefined,
    retry: (num, e) => {
      const error = (e as Error).message
      displaySnackbar({ text: error, type: 'alert' })
      return error.includes('not found') && num <= MAX_API_RETRIES
    }
  })

  if (transactionInfoError) {
    const e = transactionInfoError as Error
    txInfoError.current = e.message
    txInfoErrorStatus = txInfoError.current.includes('not found') ? 404 : 400
  }

  const confirmedTxInfo = isConfirmedTx(transactionData) ? transactionData : undefined

  previousTransactionData.current = confirmedTxInfo

  const { data: txBlock } = useQuery({
    ...queries.blocks.block.one(confirmedTxInfo?.blockHash || ''),
    enabled: !!confirmedTxInfo
  })

  const { data: chainHeights } = useQuery(queries.infos.all.heights())

  const assetIds = _(confirmedTxInfo?.inputs?.flatMap((i) => i.tokens?.map((t) => t.id)))
    .uniq()
    .compact()
    .value()

  const txChain = chainHeights?.find(
    (c: PerChainHeight) => c.chainFrom === txBlock?.chainFrom && c.chainTo === txBlock.chainTo
  )

  const confirmations = computeConfirmations(txBlock, txChain)

  const { alph: alphDeltaAmounts, tokens: tokenDeltaAmounts } = calculateIoAmountsDelta(
    transactionData?.inputs,
    transactionData?.outputs
  )

  const tokenMetadataInvolved = useAssetsMetadata(assetIds)
  const addressesInvolved = uniq([...Object.keys(alphDeltaAmounts), ...Object.keys(tokenDeltaAmounts)])

  const getSortedTokens = useCallback(
    (tokenIds: string[]) => {
      const unsorted = tokenIds.map((tokenId) => {
        const fungibleTokenMetadata = tokenMetadataInvolved.fungibleTokens.find((t) => t.id === tokenId)

        if (fungibleTokenMetadata) {
          const type: AssetType = 'fungible'
          return { tokenId, type, verified: fungibleTokenMetadata.verified, title: fungibleTokenMetadata.symbol }
        }

        const nftMetadata = tokenMetadataInvolved.nfts.find((nft) => nft.id === tokenId)

        if (nftMetadata) {
          const type: AssetType = 'non-fungible'
          return { tokenId, type, verified: nftMetadata.verified, title: nftMetadata.file?.name }
        }

        return { tokenId }
      })

      return sortBy(unsorted, [
        (v) => !v.type,
        (v) => !v.verified,
        (v) => v.type === 'non-fungible',
        (v) => v.type === 'fungible',
        (v) => v.title
      ])
    },
    [tokenMetadataInvolved.fungibleTokens, tokenMetadataInvolved.nfts]
  )

  const getSortedTokenAmounts = useCallback(
    (addressHash: string): { tokenId: string; type?: AssetType; amount: string; title?: string }[] => {
      const tokenIds = Object.keys(tokenDeltaAmounts[addressHash] || [])

      const sortedTokens = getSortedTokens(tokenIds)

      return sortedTokens.map((t) => ({ tokenId: t.tokenId, amount: tokenDeltaAmounts[addressHash][t.tokenId] }))
    },
    [getSortedTokens, tokenDeltaAmounts]
  )

  return (
    <Section>
      <SectionTitle title={t('Transaction')} />
      {!txInfoError.current ? (
        <>
          <Table bodyOnly isLoading={txInfoLoading}>
            {transactionData && (
              <TableBody>
                <TableRow>
                  <span>{t('Hash')}</span>
                  <HighlightedCell textToCopy={transactionData.hash}>{transactionData.hash}</HighlightedCell>
                </TableRow>
                <TableRow>
                  <span>{t('Status')}</span>
                  {confirmedTxInfo ? (
                    confirmedTxInfo.scriptExecutionOk ? (
                      <Badge
                        type="plus"
                        content={
                          <span>
                            <RiCheckLine style={{ marginRight: 5 }} size={15} />
                            {t('Success')}
                          </span>
                        }
                        inline
                      />
                    ) : (
                      <Badge type="minus" content={<span>{t('Script execution failed')}</span>} />
                    )
                  ) : (
                    <Badge
                      type="neutral"
                      content={
                        <>
                          <LoadingSpinner style={{ marginRight: 5 }} size={15} />
                          <span>{t('Pending')}</span>
                        </>
                      }
                    />
                  )}
                </TableRow>
                {confirmedTxInfo && confirmedTxInfo.blockHash && txBlock && (
                  <TableRow>
                    <span>{t('Block')}</span>
                    <span>
                      <SimpleLink
                        to={`../blocks/${confirmedTxInfo.blockHash || ''}`}
                        data-tooltip-id="default"
                        data-tooltip-content={`${t('On chain')} ${txChain?.chainFrom} → ${txChain?.chainTo}`}
                      >
                        {txBlock?.height.toString()}
                      </SimpleLink>
                      <span
                        data-tooltip-id="default"
                        data-tooltip-content={t('Number of blocks mined since')}
                        style={{ marginLeft: 10 }}
                      >
                        <Badge
                          type="neutral"
                          content={<span>{t('confirmationsKey', { count: confirmations })}</span>}
                          inline
                        />
                      </span>
                    </span>
                  </TableRow>
                )}
                {confirmedTxInfo && confirmedTxInfo.timestamp && (
                  <TableRow>
                    <span>{t('Timestamp')}</span>
                    <Timestamp timeInMs={confirmedTxInfo.timestamp} forceFormat="high" />
                  </TableRow>
                )}
                {confirmedTxInfo && (
                  <TableRow>
                    <span>{t('Assets')}</span>
                    <AssetLogos>
                      <>
                        {Object.keys(alphDeltaAmounts).length > 0 && (
                          <AssetLogo assetId={ALPH.id} size={20} showTooltip />
                        )}
                        {getSortedTokens(assetIds).map((a) => (
                          <AssetLogo key={a.tokenId} assetId={a.tokenId} size={20} showTooltip />
                        ))}
                      </>
                    </AssetLogos>
                  </TableRow>
                )}
                <TableRow highlight>
                  <span>{t('Total Amounts')}</span>
                  <DetltaAmountsContainer>
                    {addressesInvolved.map((addressHash) => (
                      <DeltaAmountsBox key={addressHash}>
                        <DeltaAmountsTitle>
                          <AddressLink address={addressHash} maxWidth="200px" />
                        </DeltaAmountsTitle>
                        <AmountList>
                          {alphDeltaAmounts[addressHash] && (
                            <Badge
                              type={BigInt(alphDeltaAmounts[addressHash]) > 0 ? 'plus' : 'minus'}
                              amount={alphDeltaAmounts[addressHash]}
                              assetId={ALPH.id}
                              displayAmountSign
                              floatRight
                            />
                          )}
                          {getSortedTokenAmounts(addressHash).map((v) => (
                            <Badge
                              key={v.tokenId}
                              type={BigInt(v.amount) > 0 ? 'plus' : 'minus'}
                              amount={BigInt(v.amount)}
                              assetId={v.tokenId}
                              displayAmountSign
                              floatRight
                            />
                          ))}
                        </AmountList>
                      </DeltaAmountsBox>
                    ))}
                  </DetltaAmountsContainer>
                </TableRow>
              </TableBody>
            )}
          </Table>

          <FeesTable bodyOnly>
            {transactionData && (
              <TableBody>
                <TableRow>
                  <span>{t('Gas Amount')}</span>
                  <span>{transactionData.gasAmount || '-'} GAS</span>
                </TableRow>
                <TableRow>
                  <span>{t('Gas Price')}</span>

                  <Amount assetId={ALPH.id} value={BigInt(transactionData.gasPrice)} fullPrecision />
                </TableRow>
                <TableRow highlight>
                  <span>{t('Transaction Fee')}</span>
                  <Badge
                    type="neutralHighlight"
                    content={
                      <Amount
                        assetId={ALPH.id}
                        value={BigInt(transactionData.gasPrice) * BigInt(transactionData.gasAmount)}
                        fullPrecision
                      />
                    }
                    minWidth={40}
                  />
                </TableRow>
              </TableBody>
            )}
          </FeesTable>

          <SecondaryTitle>{t('Inputs & outputs')}</SecondaryTitle>
          <IOTable bodyOnly isLoading={txInfoLoading}>
            <TableBody>
              {confirmedTxInfo && (
                <TableRow>
                  <span>{t('Inputs')}</span>
                  <div>
                    {confirmedTxInfo.inputs && confirmedTxInfo.inputs.length > 0 ? (
                      <TransactionIOList inputs={confirmedTxInfo.inputs} flex IOItemWrapper={IOItemContainer} />
                    ) : (
                      t('Block rewards')
                    )}
                  </div>
                </TableRow>
              )}
              {confirmedTxInfo && (
                <TableRow>
                  <span>{t('Outputs')}</span>
                  <div>
                    {confirmedTxInfo.outputs ? (
                      <TransactionIOList outputs={confirmedTxInfo.outputs} flex IOItemWrapper={IOItemContainer} />
                    ) : (
                      '-'
                    )}
                  </div>
                </TableRow>
              )}
            </TableBody>
          </IOTable>
        </>
      ) : (
        <InlineErrorMessage message={txInfoError.current} code={txInfoErrorStatus} />
      )}
    </Section>
  )
}

const isConfirmedTx = (tx?: Transaction | AcceptedTransaction | PendingTransaction): tx is Transaction =>
  !!tx && (tx as Transaction).blockHash !== undefined

const computeConfirmations = (txBlock?: explorer.BlockEntryLite, txChain?: explorer.PerChainHeight): number => {
  let confirmations = 0

  if (txBlock && txChain) {
    const chainHeight = txChain.value
    confirmations = chainHeight - txBlock.height + 1
  }

  return confirmations
}

const IOItemContainer = styled.div`
  padding: 5px 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const AssetLogos = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`

const FeesTable = styled(Table)`
  margin-top: 30px;
`

const IOTable = styled(Table)``

const DetltaAmountsContainer = styled.div`
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
`

const DeltaAmountsBox = styled.div`
  display: flex;
  padding: 4px 0;
  gap: 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border.secondary};
  padding: 8px;
`

const AmountList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`

const DeltaAmountsTitle = styled.div`
  flex: 1;
  overflow: hidden;
`

export default TransactionInfoPage
