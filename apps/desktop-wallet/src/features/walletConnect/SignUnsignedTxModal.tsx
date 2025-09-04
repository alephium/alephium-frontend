import { isGrouplessAddress, selectAddressByHash, SignUnsignedTxModalProps, transactionSent } from '@alephium/shared'
import { nodeTransactionReconstructDecodedUnsignedTxQuery, useTransactionAmountDeltas } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { explorer as e, SignUnsignedTxResult } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import ExpandableSection from '@/components/ExpandableSection'
import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import AddressesDataRows from '@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows'
import TransactionSummary from '@/features/transactionsDisplay/TransactionSummary'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { signer } from '@/signer'

const SignUnsignedTxModal = memo(
  ({ submitAfterSign, txParams, onSuccess, ...props }: ModalBaseProp & SignUnsignedTxModalProps) => {
    const { t } = useTranslation()
    const { sendAnalytics } = useAnalytics()
    const dispatch = useAppDispatch()
    const { isLedger, onLedgerError } = useLedger()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))

    const handleSign = async () => {
      if (!signerAddress) throw Error('Signer address not found')

      let result: SignUnsignedTxResult

      if (isLedger) {
        if (isGrouplessAddress(signerAddress)) throw Error('Groupless address not supported on Ledger')

        const ledgerParams = { signerIndex: signerAddress.index, signerKeyType: signerAddress.keyType, onLedgerError }

        result = submitAfterSign
          ? await signer.signAndSubmitUnsignedTxLedger(txParams, ledgerParams)
          : await signer.signUnsignedTxLedger(txParams, ledgerParams)
      } else {
        result = submitAfterSign
          ? await signer.signAndSubmitUnsignedTx(txParams)
          : await signer.signUnsignedTx(txParams)
      }

      onSuccess(result)

      if (submitAfterSign) {
        dispatch(
          transactionSent({
            hash: result.txId,
            fromAddress: txParams.signerAddress,
            toAddress: '',
            timestamp: new Date().getTime(),
            type: 'transfer',
            status: 'sent'
          })
        )

        sendAnalytics({ event: 'Signed and submitted unsigned transaction' })
      }
    }

    return (
      <SignTxBaseModal
        title={t(submitAfterSign ? 'Sign and Send Unsigned Transaction' : 'Sign Unsigned Transaction')}
        sign={handleSign}
        isApproveButtonDisabled={isLedger}
        type="UNSIGNED_TX"
        {...props}
      >
        <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={props.dAppUrl} hasBg hasHorizontalPadding />

        <ReconstructedTransactionDetails unsignedData={props.unsignedData} txParams={txParams} />

        <ExpandableSection
          sectionTitleClosed={t('Unsigned transaction')}
          sectionTitleOpen={t('Unsigned transaction')}
          centered
        >
          <InputFieldsColumn style={{ marginTop: 'var(--spacing-4)' }}>
            <InfoBox label={t('Transaction ID')} text={props.unsignedData.unsignedTx.txId} wordBreak />
            <InfoBox label={t('Unsigned transaction')} text={txParams.unsignedTx} wordBreak />
          </InputFieldsColumn>
        </ExpandableSection>
      </SignTxBaseModal>
    )
  }
)

export default SignUnsignedTxModal

const ReconstructedTransactionDetails = ({
  unsignedData,
  txParams
}: Pick<SignUnsignedTxModalProps, 'unsignedData' | 'txParams'>) => {
  const { data: tx } = useQuery(nodeTransactionReconstructDecodedUnsignedTxQuery({ decodedUnsignedTx: unsignedData }))

  if (!tx) return null

  return <DecodedTransactionDetails tx={tx} txParams={txParams} />
}

const DecodedTransactionDetails = ({
  tx,
  txParams
}: {
  tx: e.AcceptedTransaction
  txParams: SignUnsignedTxModalProps['txParams']
}) => {
  const { t } = useTranslation()
  const fees = useMemo(() => BigInt(tx.gasAmount) * BigInt(tx.gasPrice), [tx])
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, txParams.signerAddress)
  const assetAmounts = useMemo(
    () => (alphAmount !== BigInt(0) ? [{ id: ALPH.id, amount: alphAmount }, ...tokenAmounts] : tokenAmounts),
    [alphAmount, tokenAmounts]
  )

  return (
    <>
      <SectionTitle>{t('Decoded transaction details')}</SectionTitle>
      <TransactionSummaryStyled tx={tx} referenceAddress={txParams.signerAddress} hideType />
      <Box hasBg hasHorizontalPadding>
        <AddressesDataRows tx={tx} referenceAddress={txParams.signerAddress} />
      </Box>

      {assetAmounts && <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />}
    </>
  )
}

const TransactionSummaryStyled = styled(TransactionSummary)`
  margin: 0;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const SectionTitle = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 14px;
  margin-top: 0;
  font-weight: var(--fontWeight-bold);
  text-align: center;
`
