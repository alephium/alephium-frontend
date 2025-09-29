import {
  isGrouplessAddress,
  selectAddressByHash,
  signAndSubmitTxResultToSentTx,
  SignDeployContractTxModalProps,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignDeployContractTxResult } from '@alephium/web3'
import { memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import TokenAmountsBox from '@/components/TokenAmountsBox'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import InfoRow from '@/features/send/InfoRow'
import BytecodeExpandableSection from '@/features/walletConnect/BytecodeExpandableSection'
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

    const handleSignAndSubmit = useCallback(async () => {
      if (!signerAddress) throw Error('Signer address not found')

      let result: SignDeployContractTxResult

      if (isLedger) {
        if (isGrouplessAddress(signerAddress)) throw Error('Groupless address not supported on Ledger')

        result = await signer.signAndSubmitDeployContractTxLedger(txParams, {
          signerIndex: signerAddress.index,
          signerKeyType: signerAddress.keyType,
          onLedgerError
        })
      } else {
        result = await signer.signAndSubmitDeployContractTx(txParams)
      }

      onSuccess(result)

      const sentTx = signAndSubmitTxResultToSentTx({ type: 'DEPLOY_CONTRACT', txParams, result })
      dispatch(transactionSent(sentTx))

      sendAnalytics({ event: 'Deployed smart contract' })
    }, [signerAddress, isLedger, onSuccess, dispatch, txParams, sendAnalytics, onLedgerError])

    const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

    return (
      <SignTxBaseModal title={t('Deploy contract')} sign={handleSignAndSubmit} type="DEPLOY_CONTRACT" {...props}>
        <SignDeployContractTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} />
      </SignTxBaseModal>
    )
  }
)

export default SignDeployContractTxModal

export const SignDeployContractTxModalContent = ({
  txParams,
  fees,
  dAppUrl
}: Pick<SignDeployContractTxModalProps, 'txParams' | 'dAppUrl'> & { fees: bigint }) => {
  const { t } = useTranslation()

  const initialAlphAmount = txParams.initialAttoAlphAmount
    ? [{ id: ALPH.id, amount: BigInt(txParams.initialAttoAlphAmount) }]
    : undefined
  const issueTokenAmount = txParams.issueTokenAmount?.toString()

  return (
    <>
      {initialAlphAmount && (
        <TokenAmountsBox assetAmounts={initialAlphAmount} hasBg hasHorizontalPadding shouldAddAlphForDust />
      )}
      {issueTokenAmount && <InfoRow label={t('Issue token amount')}>{issueTokenAmount}</InfoRow>}
      <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={dAppUrl} hasBg hasHorizontalPadding />
      {initialAlphAmount && (
        <CheckWorthBox assetAmounts={initialAlphAmount} fee={fees} hasBg hasBorder hasHorizontalPadding />
      )}
      <BytecodeExpandableSection bytecode={txParams.bytecode} />
    </>
  )
}
