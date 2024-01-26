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

import { isMempoolTx } from '@alephium/shared'
import { MempoolTransaction, Transaction } from '@alephium/web3/dist/src/api/api-explorer'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { RiArrowRightLine } from 'react-icons/ri'
import styled, { css, useTheme } from 'styled-components'

import Amount from '@/components/Amount'
import AssetLogo from '@/components/AssetLogo'
import Badge from '@/components/Badge'
import { AddressLink, TightLink } from '@/components/Links'
import Table from '@/components/Table/Table'
import TableBody from '@/components/Table/TableBody'
import { AnimatedCell, DetailToggle, TableDetailsRow } from '@/components/Table/TableDetailsRow'
import TableHeader from '@/components/Table/TableHeader'
import TableRow from '@/components/Table/TableRow'
import Timestamp from '@/components/Timestamp'
import TransactionIOList from '@/components/TransactionIOList'
import useTableDetailsState from '@/hooks/useTableDetailsState'
import { getTransactionUI } from '@/hooks/useTransactionUI'
import { useTransactionInfo } from '@/utils/transactions'

interface AddressTransactionRowProps {
  transaction: Transaction | MempoolTransaction
  addressHash: string
  isInContract: boolean
}

const directionIconSize = 14

const AddressTransactionRow = ({ transaction: tx, addressHash, isInContract }: AddressTransactionRowProps) => {
  const { t } = useTranslation()
  const { detailOpen, toggleDetail } = useTableDetailsState(false)
  const theme = useTheme()

  const { assets, infoType } = useTransactionInfo(tx, addressHash)

  const isMoved = infoType === 'move'
  const isPending = isMempoolTx(tx)
  const isFailedScriptExecution = (tx as Transaction).scriptExecutionOk === false

  const { label, Icon, badgeColor, badgeBgColor, directionText } = getTransactionUI({
    infoType,
    isFailedScriptTx: isFailedScriptExecution,
    isInContract,
    theme
  })

  const renderOutputAccounts = () => {
    if (!tx.outputs) return
    // Check for auto-sent tx
    if (tx.outputs.every((o) => o.address === addressHash)) {
      return <AddressLink key={addressHash} address={addressHash} maxWidth="250px" />
    } else {
      const outputs = _(tx.outputs.filter((o) => o.address !== addressHash))
        .map((v) => v.address)
        .uniq()
        .value()

      return (
        <div>
          <AddressLink address={outputs[0]} maxWidth="250px" />
          {outputs.length > 1 && ` (+ ${outputs.length - 1})`}
        </div>
      )
    }
  }

  const renderInputAccounts = () => {
    if (!tx.inputs) return
    const inputs = _(tx.inputs.filter((o) => o.address !== addressHash))
      .map((v) => v.address)
      .uniq()
      .value()

    return inputs.length > 0 ? (
      <div>
        {inputs[0] && <AddressLink address={inputs[0]} maxWidth="250px" />}
        {inputs.length > 1 && ` (+ ${inputs.length - 1})`}
      </div>
    ) : (
      <BlockRewardLabel>{t('Block rewards')}</BlockRewardLabel>
    )
  }

  return (
    <>
      <TableRowStyled key={tx.hash} isActive={detailOpen} onClick={toggleDetail} pending={isPending}>
        <HashAndTimestamp>
          <TightLink to={`/transactions/${tx.hash}`} text={tx.hash} maxWidth="120px" />
          {!isPending && tx.timestamp && <Timestamp timeInMs={tx.timestamp} />}
        </HashAndTimestamp>
        <TxLabelBadgeContainer>
          <TxLabelBadge
            style={{
              backgroundColor: badgeBgColor,
              border: `1px solid ${badgeBgColor}`
            }}
          >
            {Icon && <Icon size={directionIconSize} color={badgeColor} />}
            <TxLabel style={{ color: badgeColor }}>{label}</TxLabel>
          </TxLabelBadge>
          {!isPending && !tx.scriptExecutionOk && (
            <FailedTXBubble data-tooltip-id="default" data-tooltip-content="Script execution failed">
              !
            </FailedTXBubble>
          )}
        </TxLabelBadgeContainer>

        <Assets>
          {assets.map((a) => (
            <AssetLogo key={a.id} assetId={a.id} size={21} showTooltip />
          ))}
        </Assets>

        <Badge type="neutral" compact content={directionText} floatRight minWidth={40} />

        {!isPending && (infoType === 'move' || infoType === 'out' ? renderOutputAccounts() : renderInputAccounts())}
        {!isPending && (
          <AmountCell>
            {assets.map(({ id, amount, symbol, decimals }) => (
              <Amount
                key={id}
                assetId={id}
                value={amount}
                highlight={!isMoved}
                displaySign={!isMoved}
                color={isMoved ? theme.font.secondary : undefined}
                suffix={symbol}
                decimals={decimals}
              />
            ))}
          </AmountCell>
        )}
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

export default AddressTransactionRow

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
