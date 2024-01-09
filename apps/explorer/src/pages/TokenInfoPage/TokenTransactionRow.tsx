/*
Copyright 2018 - 2022 The Alephium Authors
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

import { isMempoolTx } from '@alephium/shared'
import { addressFromTokenId } from '@alephium/web3'
import { explorer } from '@alephium/web3'
import { MempoolTransaction, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import _, { sortBy } from 'lodash'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { RiArrowRightLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

import { useAssetsMetadata } from '@/api/assets/assetsHooks'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import { TightLink } from '@/components/Links'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import TransactionIOList from '@/components/TransactionIOList'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { AssetType } from '@/types/assets'
import { useTransactionAssetInfo } from '@/utils/transactions'
import { IOAmountsDelta } from '@/utils/transactions'

interface TokenTransactionRowProps {
  transaction: Transaction | MempoolTransaction
  tokenHash: string
}

const directionIconSize = 14

const TokenTransactionRow = ({ transaction: tx, tokenHash }: TokenTransactionRowProps) => {
  const { t } = useTranslation()
  const { detailOpen, toggleDetail } = useTableDetailsState(false)
  const theme = useTheme()

  const isPending = isMempoolTx(tx)
  const isFailedScriptExecution = (tx as Transaction).scriptExecutionOk === false

  const assetIds = _(tx?.inputs?.flatMap((i) => i.tokens?.map((t) => t.id)))
    .uniq()
    .compact()
    .value()

  const assets = useTransactionAssetInfo(tx)
  console.log('******* assets: ' + assets)

  const tokenMetadataInvolved = useAssetsMetadata(assetIds)

  const { alph: alphDeltaAmounts, tokens: tokenDeltaAmounts } = IOAmountsDelta(tx?.inputs, tx?.outputs)

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
          return { tokenId, type, verified: nftMetadata.verified, title: nftMetadata.file.name }
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

  const outputs = tx.outputs as explorer.AssetOutput[]
  const totalAmount = outputs
    .map((output) => {
      const total = output.tokens
        ?.filter((token) => token.id == tokenHash)
        .reduce<bigint>((acc, o) => acc + BigInt(o.amount), BigInt(0))
      return total == undefined ? BigInt(0) : total
    })
    .reduce<bigint>((acc, a) => acc + BigInt(a), BigInt(0))

  return (
    <>
      <TableRowStyled key={tx.hash} isActive={detailOpen} onClick={toggleDetail} pending={isPending}>
        <HashAndTimestamp>
          <TightLink to={`/transactions/${tx.hash}`} text={tx.hash} maxWidth="120px" />
          {!isPending && tx.timestamp && <Timestamp timeInMs={tx.timestamp} />}
        </HashAndTimestamp>
        <Assets>
          {assetIds.map((id) => (
            <AssetLogo key={id} assetId={id} size={21} showTooltip />
          ))}
        </Assets>

        <span>
          {tx.inputs ? tx.inputs.length : 0} {tx.inputs && tx.inputs.length === 1 ? 'address' : 'addresses'}
        </span>
        <RiArrowRightLine size={15} />
        <span>
          {outputs ? outputs.length : 0} {outputs?.length === 1 ? 'address' : 'addresses'}
        </span>
        <Badge type="neutralHighlight" assetId={tokenHash} amount={totalAmount} floatRight />
        {!isPending && <DetailToggle isOpen={detailOpen} />}
      </TableRowStyled>
      {!isPending && (
        <TableDetailsRow openCondition={detailOpen}>
          <AnimatedCell colSpan={7}>
            <Table>
              <TableHeader headerTitles={['Inputs', '', 'Outputs']} columnWidths={['', '50px', '']} compact />
              <TableBody>
                <TableRow>
                  <IODetailList>
                    {tx.inputs && tx.inputs.length > 0 ? (
                      <TransactionIOList
                        inputs={tx.inputs}
                        IOItemWrapper={IODetailsContainer}
                        addressMaxWidth="180px"
                        flex
                      />
                    ) : (
                      <BlockRewardInputLabel>Block rewards</BlockRewardInputLabel>
                    )}
                  </IODetailList>

                  <span style={{ textAlign: 'center' }}>
                    <RiArrowRightLine size={12} />
                  </span>

                  <IODetailList>
                    {tx.outputs && (
                      <TransactionIOList
                        outputs={tx.outputs}
                        IOItemWrapper={IODetailsContainer}
                        addressMaxWidth="180px"
                        flex
                      />
                    )}
                  </IODetailList>
                </TableRow>
              </TableBody>
            </Table>
          </AnimatedCell>
        </TableDetailsRow>
      )}
    </>
  )
}

export default TokenTransactionRow

const TableRowStyled = styled(TableRow)<{ pending: boolean }>`
  ${({ pending, theme }) =>
    pending &&
    css`
      background-color: ${theme.bg.secondary};
      border-bottom: 1px solid ${theme.border.secondary};
      cursor: initial;

      > * {
        opacity: 0.5;
        animation: opacity-breathing 2s ease infinite;
      }

      @keyframes opacity-breathing {
        0% {
          opacity: 0.4;
        }
        50% {
          opacity: 0.8;
        }
        100% {
          opacity: 0.4;
        }
      }
    `}
`

const BlockRewardLabel = styled.span`
  color: ${({ theme }) => theme.font.secondary};
  font-style: italic;
`

const BlockRewardInputLabel = styled(BlockRewardLabel)`
  padding: 18px 15px;
  text-align: center;
`

const AmountCell = styled.span`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-weight: 600;
`

const TxLabelBadgeContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  float: left;
  border-radius: 4px;
`

const TxLabelBadge = styled.div`
  display: flex;
  padding: 2px 5px;
  border-radius: 4px;
  gap: 5px;
  align-items: center;
  justify-content: center;
`

const TxLabel = styled.div`
  font-size: 11px;
`

const HashAndTimestamp = styled.div`
  ${Timestamp} {
    color: ${({ theme }) => theme.font.secondary};
    font-size: 12px;
    margin-top: 2px;
    width: fit-content;
  }
`

const Assets = styled.div`
  display: flex;
  gap: 15px;
  row-gap: 15px;
  flex-wrap: wrap;
`

const IODetailList = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 9px;
`

const IODetailsContainer = styled.div`
  padding: 15px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }
`

const FailedTXBubble = styled.div`
  position: absolute;
  height: 14px;
  width: 14px;
  border-radius: 14px;
  background-color: ${({ theme }) => theme.global.alert};
  color: white;
  top: auto;
  bottom: auto;
  right: -20px;
  text-align: center;
  font-size: 10px;
  font-weight: 800;
`
