import { isGrouplessAddress, selectAddressByHash, SignUnsignedTxModalProps, transactionSent } from '@alephium/shared'
import { useTransactionAmountDeltas } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { SignUnsignedTxResult } from '@alephium/web3'
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

    const fees = useMemo(
      () => BigInt(props.unsignedData.gasAmount) * BigInt(props.unsignedData.gasPrice),
      [props.unsignedData]
    )
    const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(props.unsignedData, txParams.signerAddress)
    const assetAmounts = useMemo(
      () => (alphAmount !== BigInt(0) ? [{ id: ALPH.id, amount: alphAmount }, ...tokenAmounts] : tokenAmounts),
      [alphAmount, tokenAmounts]
    )

    return (
      <SignTxBaseModal
        title={t(submitAfterSign ? 'Sign and Send Unsigned Transaction' : 'Sign Unsigned Transaction')}
        sign={handleSign}
        isApproveButtonDisabled={isLedger}
        type="UNSIGNED_TX"
        {...props}
      >
        <TransactionSummaryStyled tx={props.unsignedData} referenceAddress={txParams.signerAddress} hideType />
        <Box hasBg hasHorizontalPadding>
          <AddressesDataRows tx={props.unsignedData} referenceAddress={txParams.signerAddress} />
        </Box>

        {assetAmounts && <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />}

        <ExpandableSection
          sectionTitleClosed={t('Unsigned transaction')}
          sectionTitleOpen={t('Unsigned transaction')}
          centered
        >
          <CheckAddressesBox
            fromAddressStr={txParams.signerAddress}
            dAppUrl={props.dAppUrl}
            hasBg
            hasHorizontalPadding
          />
          <InputFieldsColumn style={{ marginTop: 'var(--spacing-4)' }}>
            <InfoBox label={t('Transaction ID')} text={props.unsignedData.hash} wordBreak />
            <InfoBox label={t('Unsigned transaction')} text={txParams.unsignedTx} wordBreak />
          </InputFieldsColumn>
        </ExpandableSection>
      </SignTxBaseModal>
    )
  }
)

export default SignUnsignedTxModal

const TransactionSummaryStyled = styled(TransactionSummary)`
  margin: 0;
  background-color: ${({ theme }) => theme.bg.tertiary};
`
