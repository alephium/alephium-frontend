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

import { addApostrophes } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { AssetOutput, Input } from '@alephium/web3/dist/src/api/api-explorer'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import ActionLink from '@/components/ActionLink'
import Amount from '@/components/Amount'
import DataList from '@/components/DataList'
import ExpandableSection from '@/components/ExpandableSection'
import HashEllipsed from '@/components/HashEllipsed'
import Lock from '@/components/Lock'
import { TransactionDetailsModalTxProps } from '@/features/transactionsDisplay/transactionDetailsModal/types'
import useOnAddressClick from '@/features/transactionsDisplay/transactionDetailsModal/useOnAddressClick'

const GasUTXOsExpandableSection = ({ tx }: Pick<TransactionDetailsModalTxProps, 'tx'>) => {
  const { t } = useTranslation()
  const handleShowAddress = useOnAddressClick()

  const renderInput = (input: Input) => {
    const addressHash = input.address
    if (!addressHash) return null

    return (
      <ActionLinkStyled key={`${input.outputRef.key}`} onClick={() => handleShowAddress(addressHash)}>
        <HashEllipsed key={`${input.outputRef.key}`} hash={addressHash} />
      </ActionLinkStyled>
    )
  }

  const renderOutput = (output: AssetOutput) => {
    const unlocksAt = new Date(output.lockTime ?? 0)
    const isLockTimeInFuture = unlocksAt > new Date()

    return (
      <OutputRow key={output.key}>
        {isLockTimeInFuture && <Lock unlockAt={unlocksAt} />}
        <ActionLinkStyled
          key={`${output.key}`}
          onClick={() => handleShowAddress(output.address)}
          hasLock={isLockTimeInFuture}
        >
          <HashEllipsed key={`${output.key}`} hash={output.address} />
        </ActionLinkStyled>
      </OutputRow>
    )
  }

  let gasAmount

  try {
    gasAmount = addApostrophes(tx.gasAmount.toString())
  } catch {
    console.error('Could not add apostrophes to gas amount')
  }

  return (
    <ExpandableSectionStyled sectionTitleClosed={t('Click to see more')} sectionTitleOpen={t('Click to see less')}>
      <DataList>
        {gasAmount && (
          <DataList.Row label={t('Gas amount')}>
            <span tabIndex={0}>{gasAmount}</span>
          </DataList.Row>
        )}

        <DataList.Row label={t('Gas price')}>
          <Amount tokenId={ALPH.id} tabIndex={0} value={BigInt(tx.gasPrice)} fullPrecision />
        </DataList.Row>

        {tx.inputs && (
          <DataList.Row label={t('Inputs')}>
            <AddressList>{tx.inputs.map(renderInput)}</AddressList>
          </DataList.Row>
        )}

        {tx.outputs && (
          <DataList.Row label={t('Outputs')}>
            <AddressList>{tx.outputs.map(renderOutput)}</AddressList>
          </DataList.Row>
        )}
      </DataList>
    </ExpandableSectionStyled>
  )
}

export default GasUTXOsExpandableSection

const ExpandableSectionStyled = styled(ExpandableSection)`
  margin-top: var(--spacing-2);
`

const OutputRow = styled.div`
  display: flex;
  gap: 8px;
`

const AddressList = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 5px;
`

const ActionLinkStyled = styled(ActionLink)<{ hasLock?: boolean }>`
  width: ${({ hasLock }) => (hasLock ? 90 : 100)}%;
  justify-content: flex-end;
`
