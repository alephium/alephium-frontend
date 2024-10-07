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

import { AddressHash, getHumanReadableError } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { node } from '@alephium/web3'
import { Info } from 'lucide-react'
import { memo, useCallback, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { buildSweepTransactions, signAndSendTransaction } from '@/api/transactions'
import Amount from '@/components/Amount'
import HorizontalDivider from '@/components/Dividers/HorizontalDivider'
import InfoBox from '@/components/InfoBox'
import AddressSelect from '@/components/Inputs/AddressSelect'
import { useAddressesWithBalance } from '@/features/addressFiltering/addressFilteringHooks'
import useAnalytics from '@/features/analytics/useAnalytics'
import { closeModal } from '@/features/modals/modalActions'
import { AddressModalBaseProp, ModalBaseProp } from '@/features/modals/modalTypes'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import CenteredModal, { ModalFooterButton, ModalFooterButtons } from '@/modals/CenteredModal'
import { selectAddressByHash, selectAllAddresses, selectAllAddressHashes } from '@/storage/addresses/addressesSelectors'
import {
  transactionBuildFailed,
  transactionSendFailed,
  transactionSent
} from '@/storage/transactions/transactionsActions'
import { Address } from '@/types/addresses'
import { getName } from '@/utils/addresses'

export interface AddressSweepModalProps extends AddressModalBaseProp {
  onSuccessfulSweep?: () => void
  isUtxoConsolidation?: boolean
}

const AddressSweepModal = memo(
  ({ id, addressHash, onSuccessfulSweep, isUtxoConsolidation }: ModalBaseProp & AddressSweepModalProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch()
    const addresses = useAppSelector(selectAllAddresses)
    const allAddressHashes = useAppSelector(selectAllAddressHashes)
    const { sendAnalytics } = useAnalytics()
    const fromAddress = useAppSelector((s) => selectAddressByHash(s, addressHash))

    const toAddressOptions = addressHash ? addresses.filter(({ hash }) => hash !== fromAddress?.hash) : addresses
    const fromAddressOptions = useAddressesWithBalance()

    const [sweepAddresses, setSweepAddresses] = useState<{ from?: Address; to?: Address }>({
      from: fromAddress,
      to: toAddressOptions.length > 0 ? toAddressOptions[0] : fromAddress
    })
    const [fee, setFee] = useState(BigInt(0))
    const [builtUnsignedTxs, setBuiltUnsignedTxs] = useState<node.SweepAddressTransaction[]>()
    const [isLoading, setIsLoading] = useState(false)

    const isConsolidationRedundant = builtUnsignedTxs && builtUnsignedTxs.length === 0
    const isConsolidationButtonDisabled = !builtUnsignedTxs || builtUnsignedTxs.length === 0

    useEffect(() => {
      const buildTransactions = async () => {
        if (!sweepAddresses.from || !sweepAddresses.to) return
        setIsLoading(true)
        try {
          const { unsignedTxs, fees } = await buildSweepTransactions(sweepAddresses.from, sweepAddresses.to.hash)

          setBuiltUnsignedTxs(unsignedTxs)
          setFee(fees)
        } catch (e) {
          const message = 'Error while building transaction'

          dispatch(transactionBuildFailed(getHumanReadableError(e, t(message))))
          sendAnalytics({ type: 'error', message })
        }
        setIsLoading(false)
      }

      buildTransactions()
    }, [dispatch, sendAnalytics, sweepAddresses.from, sweepAddresses.to, t])

    const onAddressChange = useCallback(
      (type: 'from' | 'to', addressHash: AddressHash) => {
        setSweepAddresses((prev) => ({ ...prev, [type]: addresses.find((a) => a.hash === addressHash) }))
      },
      [addresses]
    )

    const handleOriginAddressChange = useCallback(
      (newAddress: AddressHash) => onAddressChange('from', newAddress),
      [onAddressChange]
    )

    const handleDestinationAddressChange = useCallback(
      (newAddress: AddressHash) => onAddressChange('to', newAddress),
      [onAddressChange]
    )

    if (!sweepAddresses.from || !sweepAddresses.to) return null

    const onClose = () => dispatch(closeModal({ id }))

    const handleSweepClick = async () => {
      if (!sweepAddresses.from || !sweepAddresses.to || !builtUnsignedTxs) return
      setIsLoading(true)
      try {
        for (const { txId, unsignedTx } of builtUnsignedTxs) {
          const data = await signAndSendTransaction(sweepAddresses.from, txId, unsignedTx)

          dispatch(
            transactionSent({
              hash: data.txId,
              fromAddress: sweepAddresses.from.hash,
              toAddress: sweepAddresses.to.hash,
              timestamp: new Date().getTime(),
              type: 'sweep',
              status: 'sent'
            })
          )
        }

        onClose()
        onSuccessfulSweep && onSuccessfulSweep()

        sendAnalytics({ event: 'Swept address assets' })
      } catch (error) {
        dispatch(
          transactionSendFailed(
            getHumanReadableError(error, t('Error while sweeping address {{ from }}', { from: sweepAddresses.from }))
          )
        )
        sendAnalytics({ type: 'error', message: 'Sweeping address' })
      }
      setIsLoading(false)
    }

    return (
      <CenteredModal
        title={!isUtxoConsolidation ? t`Sweep address` : t`Consolidate UTXOs`}
        id={id}
        isLoading={isLoading}
      >
        <Content>
          <AddressSelect
            label={t('From address')}
            title={t('Select the address to sweep the funds from.')}
            addressOptions={fromAddressOptions}
            defaultAddress={sweepAddresses.from.hash}
            onAddressChange={handleOriginAddressChange}
            disabled={!isUtxoConsolidation}
            id="from-address"
          />
          <AddressSelect
            label={t('To address')}
            title={t('Select the address to sweep the funds to.')}
            addressOptions={
              !isUtxoConsolidation ? allAddressHashes.filter((hash) => hash !== fromAddress?.hash) : allAddressHashes
            }
            defaultAddress={sweepAddresses.to.hash}
            onAddressChange={handleDestinationAddressChange}
            id="to-address"
          />
          {isConsolidationRedundant ? (
            <InfoBox Icon={Info} importance="warning">
              {t('All UTXOs are already consolidated for this address. No consolidation is needed.')}
            </InfoBox>
          ) : (
            <>
              <InfoBox Icon={Info} contrast noBorders>
                <Trans
                  t={t}
                  i18nKey="sweepOperationFromTo"
                  values={{ from: getName(sweepAddresses.from), to: getName(sweepAddresses.to) }}
                  components={{
                    1: <ColoredWord color={sweepAddresses.from.color} />,
                    3: <ColoredWord color={sweepAddresses.to.color} />
                  }}
                >
                  {'This operation will sweep all funds from <1>{{ from }}</1> and transfer them to <3>{{ to }}</3>.'}
                </Trans>
              </InfoBox>
              <Fee>
                {t('Fee')}
                <Amount tokenId={ALPH.id} value={fee} />
              </Fee>
            </>
          )}
        </Content>
        <HorizontalDivider narrow />
        <ModalFooterButtons>
          <ModalFooterButton role="secondary" onClick={onClose}>
            {t('Cancel')}
          </ModalFooterButton>
          <ModalFooterButton onClick={handleSweepClick} disabled={isConsolidationButtonDisabled}>
            {!isUtxoConsolidation ? t('Sweep') : t('Consolidate')}
          </ModalFooterButton>
        </ModalFooterButtons>
      </CenteredModal>
    )
  }
)

export default AddressSweepModal

const Fee = styled.div`
  padding: 12px;
  display: flex;
  gap: 80px;
  width: 100%;
`

const ColoredWord = styled.span`
  color: ${({ color }) => color};
`

const Content = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 var(--spacing-3);
`
