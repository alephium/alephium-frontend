import {
  isGrouplessKeyType,
  selectAddressByHash,
  SignDeployContractTxModalProps,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignDeployContractTxResult } from '@alephium/web3'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import BytecodeExpandableSection from '@/features/send/BytecodeExpandableSection'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import InfoRow from '@/features/send/InfoRow'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { signer } from '@/signer'

const SignDeployContractTxModal = memo(
  ({ dAppUrl, txParams, unsignedData, onSuccess, ...props }: SignDeployContractTxModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()
    const { isLedger, onLedgerError } = useLedger()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
    const { sendAnalytics } = useAnalytics()

    const onSignAndSubmit = useCallback(async () => {
      if (!signerAddress) throw Error('Signer address not found')

      let result: SignDeployContractTxResult

      if (isLedger) {
        if (isGrouplessKeyType(signerAddress.keyType)) throw Error('Groupless address not supported on Ledger')

        result = await signer.signAndSubmitDeployContractTxLedger(txParams, {
          signerIndex: signerAddress.index,
          signerKeyType: signerAddress.keyType ?? 'default',
          onLedgerError
        })
      } else {
        result = await signer.signAndSubmitDeployContractTx(txParams)
      }

      onSuccess(result)

      dispatch(
        transactionSent({
          hash: result.txId,
          fromAddress: txParams.signerAddress,
          toAddress: '',
          timestamp: new Date().getTime(),
          type: 'contract',
          status: 'sent'
        })
      )

      sendAnalytics({ event: 'Deployed smart contract' })
    }, [signerAddress, isLedger, onSuccess, dispatch, txParams, sendAnalytics, onLedgerError])

    const initialAlphAmount = txParams.initialAttoAlphAmount
      ? [{ id: ALPH.id, amount: BigInt(txParams.initialAttoAlphAmount) }]
      : undefined
    const issueTokenAmount = txParams.issueTokenAmount?.toString()
    const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

    return (
      <SignTxBaseModal
        title={t('Deploy contract')}
        onSignAndSubmit={onSignAndSubmit}
        txParams={txParams}
        unsignedData={unsignedData}
        onSuccess={onSuccess}
        {...props}
      >
        {initialAlphAmount && <CheckAmountsBox assetAmounts={initialAlphAmount} hasBg hasHorizontalPadding />}
        {issueTokenAmount && <InfoRow label={t('Issue token amount')}>{issueTokenAmount}</InfoRow>}
        <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={dAppUrl} hasBg hasHorizontalPadding />
        {initialAlphAmount && (
          <CheckWorthBox assetAmounts={initialAlphAmount} fee={fees} hasBg hasBorder hasHorizontalPadding />
        )}
        <BytecodeExpandableSection bytecode={txParams.bytecode} />
      </SignTxBaseModal>
    )
  }
)

export default SignDeployContractTxModal
