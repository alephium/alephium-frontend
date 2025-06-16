import { transactionSent } from '@alephium/shared'
import { node as n, SignExecuteScriptTxResult } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import AssetsAmountsRows from '~/features/ecosystem/modals/AssetsAmountsRows'
import CopyBytecodeRow from '~/features/ecosystem/modals/CopyBytecodeRow'
import DestinationDappRow from '~/features/ecosystem/modals/DestinationDappRow'
import FeesRow from '~/features/ecosystem/modals/FeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { ModalOrigin } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'
import { SignExecuteScriptTxParamsWithAmounts } from '~/types/transactions'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface SignExecuteScriptTxModalProps {
  txParams: SignExecuteScriptTxParamsWithAmounts
  unsignedData: n.BuildExecuteScriptTxResult
  onError: (message: string) => void
  onSuccess: (signResult: SignExecuteScriptTxResult) => void
  onReject: () => void
  origin: ModalOrigin
  dAppUrl?: string
  dAppIcon?: string
}

const SignExecuteScriptTxModal = memo(
  ({
    id,
    txParams,
    unsignedData,
    dAppUrl,
    dAppIcon,
    origin,
    onError,
    onReject,
    onSuccess
  }: SignExecuteScriptTxModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const { handleApprovePress, handleRejectPress, onDismiss, fees } = useSignModal({
      id,
      onReject,
      onError,
      unsignedData,
      sendTransaction: async () => {
        const data = await signAndSendTransaction(txParams.signerAddress, unsignedData.txId, unsignedData.unsignedTx)
        const { attoAlphAmount, tokens } = getTransactionAssetAmounts(txParams.assetAmounts)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: txParams.signerAddress,
            amount: attoAlphAmount,
            tokens,
            timestamp: new Date().getTime(),
            status: 'sent',
            type: 'contract',
            toAddress: ''
          })
        )

        sendAnalytics({ event: 'Approved contract call', props: { origin } })

        onSuccess({
          groupIndex: unsignedData.fromGroup,
          unsignedTx: unsignedData.unsignedTx,
          txId: unsignedData.txId,
          signature: data.signature,
          gasAmount: unsignedData.gasAmount,
          gasPrice: BigInt(unsignedData.gasPrice),
          simulatedOutputs: []
        })
      }
    })

    return (
      <BottomModal2 onDismiss={onDismiss} modalId={id} contentVerticalGap>
        <ScreenSection>
          <Surface>
            <AssetsAmountsRows assetAmounts={txParams.assetAmounts} />

            <Row title={t('From')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            {dAppUrl && <DestinationDappRow dAppUrl={dAppUrl} dAppIcon={dAppIcon} />}

            <CopyBytecodeRow bytecode={txParams.bytecode} />

            <FeesRow fees={fees} />
          </Surface>
        </ScreenSection>
        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignExecuteScriptTxModal
