import { isGrouplessKeyType, selectAddressByHash, SignUnsignedTxModalProps, transactionSent } from '@alephium/shared'
import { SignUnsignedTxResult } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
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
        if (isGrouplessKeyType(signerAddress.keyType)) throw Error('Groupless address not supported on Ledger')

        const ledgerParams = {
          signerIndex: signerAddress.index,
          signerKeyType: signerAddress.keyType ?? 'default',
          onLedgerError
        }

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
        <InputFieldsColumn>
          <InfoBox label={t('Transaction ID')} text={props.unsignedData.txId} wordBreak />
          {/* TODO: Should show decoded unsigned data, see https://github.com/alephium/alephium-web3/blob/3cb9b2f5079b8cb41d284f81078bc2894880d143/packages/web3/src/signer/signer.ts#L186 */}
          <InfoBox label={t('Unsigned transaction')} text={txParams.unsignedTx} wordBreak />
        </InputFieldsColumn>
      </SignTxBaseModal>
    )
  }
)

export default SignUnsignedTxModal
