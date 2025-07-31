import { isConfirmedTx, isSameBaseAddress } from '@alephium/shared'
import { isGrouplessAddressWithoutGroupIndex } from '@alephium/web3'
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

  const { assets, infoType, direction } = useTransactionInfo(tx, addressHash)
  const isGrouplessAddress = isGrouplessAddressWithoutGroupIndex(addressHash)

  const isMoved = infoType === 'move' || (infoType === 'moveGroup' && isGrouplessAddress)

  const isPending = !isConfirmedTx(tx)
  const isFailedScriptExecution = (tx as Transaction).scriptExecutionOk === false

  const { label, Icon, badgeColor, badgeBgColor, directionText } = getTransactionUI({
    infoType,
    isFailedScriptTx: isFailedScriptExecution,
    isInContract,
    theme,
    direction
  })

  const renderOutputAccounts = () => {
    if (!tx.outputs) return

    // Check if all output addresses are the same for self-transfer, group transfer, or sweep
    const firstAddress = tx.outputs[0]?.address
    if (firstAddress && tx.outputs.every((o) => o.address === firstAddress)) {
      return <AddressLink key={firstAddress} address={firstAddress} maxWidth="250px" />
    }

    const outputs = _(
      tx.outputs.filter((o) =>
        isGrouplessAddress ? !isSameBaseAddress(addressHash, o.address) : o.address !== addressHash
      )
    )
      .map((v) => v.address)
      .uniq()
      .value()

    return (
      <div>
        <AddressLink address={outputs.at(0) ?? ''} maxWidth="250px" />
        {outputs.length > 1 && ` (+ ${outputs.length - 1})`}
      </div>
    )
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
            <FailedTXBubble data-tooltip-id="default" data-tooltip-content={t('Script execution failed')}>
              !
            </FailedTXBubble>
          )}
        </TxLabelBadgeContainer>

        <Assets>
          {assets.alph.amount !== BigInt(0) && (
            <AssetLogo key={assets.alph.id} assetId={assets.alph.id} size={21} showTooltip />
          )}
          {[...assets.fungible, ...assets['non-fungible']].map((a) => (
            <AssetLogo key={a.id} assetId={a.id} size={21} showTooltip />
          ))}
        </Assets>

        <Badge type="neutral" compact content={directionText} floatRight minWidth={40} />

        {!isPending &&
          (infoType === 'moveGroup' && direction === 'in' ? (
            renderInputAccounts()
          ) : infoType === 'move' || infoType === 'moveGroup' || infoType === 'out' ? (
            isGrouplessAddress && !direction ? (
              <AddressLink address={addressHash} maxWidth="250px" />
            ) : (
              renderOutputAccounts()
            )
          ) : (
            renderInputAccounts()
          ))}
        {!isPending && (
          <AmountCell>
            <Amount
              key={assets.alph.id}
              assetId={assets.alph.id}
              value={assets.alph.amount}
              suffix={assets.alph.symbol}
              decimals={assets.alph.decimals}
              highlight
              displaySign
            />
            {assets.fungible.map((asset) => (
              <Amount
                key={asset.id}
                assetId={asset.id}
                value={asset.amount}
                suffix={asset.symbol}
                decimals={asset.decimals}
                highlight
                displaySign
              />
            ))}
            {assets['non-fungible'].map((asset) => (
              <Amount
                key={asset.id}
                assetId={asset.id}
                value={asset.amount}
                color={isMoved ? theme.font.secondary : undefined}
                highlight
                displaySign
              />
            ))}
          </AmountCell>
        )}
        {!isPending && <DetailToggle isOpen={detailOpen} />}
      </TableRowStyled>
      {!isPending && (
        <TableDetailsRow openCondition={detailOpen}>
          <AnimatedCell colSpan={7}>
            <Table transparent noBorder>
              <TableHeader
                headerTitles={[t('Inputs'), '', t('Outputs')]}
                columnWidths={['', '50px', '']}
                compact
                transparent
              />
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
                      <BlockRewardInputLabel>{t('Block rewards')}</BlockRewardInputLabel>
                    )}
                  </IODetailList>

                  <ArrowContainer>
                    <RiArrowRightLine size={12} />
                  </ArrowContainer>

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
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 6px 10px;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: 6px;
`

const IODetailsContainer = styled.div`
  padding: 6px 10px;

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

const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`
