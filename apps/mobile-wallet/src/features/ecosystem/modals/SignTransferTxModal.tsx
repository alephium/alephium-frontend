import { transactionSent } from '@alephium/shared'
import { node as n, SignTransferTxResult } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { signAndSendTransaction } from '~/api/transactions'
import AddressBadge from '~/components/AddressBadge'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import AssetsAmountsRows from '~/features/ecosystem/modals/AssetsAmountsRows'
import FeesRow from '~/features/ecosystem/modals/FeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { ModalBaseProp } from '~/features/modals/modalTypes'
import { useAppDispatch } from '~/hooks/redux'
import { SignTransferTxParamsSingleDestination } from '~/types/transactions'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface SignTransferTxModalProps extends SignTxModalCommonProps {
  txParams: SignTransferTxParamsSingleDestination
  unsignedData: n.BuildTransferTxResult
  onSuccess: (signResult: SignTransferTxResult) => void
}

const SignTransferTxModal = memo(
  ({
    id,
    txParams,
    unsignedData,
    origin,
    onError,
    onUserDismiss,
    onSuccess
  }: SignTransferTxModalProps & ModalBaseProp) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const { handleApprovePress, handleRejectPress, fees } = useSignModal({
      onUserDismiss,
      onError,
      unsignedData,
      sign: async () => {
        const data = await signAndSendTransaction(txParams.signerAddress, unsignedData.txId, unsignedData.unsignedTx)
        const { attoAlphAmount, tokens } = getTransactionAssetAmounts(txParams.assetAmounts)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: txParams.signerAddress,
            toAddress: txParams.toAddress,
            amount: attoAlphAmount,
            tokens,
            timestamp: new Date().getTime(),
            status: 'sent',
            type: 'transfer'
          })
        )

        sendAnalytics({ event: 'Approved transfer', props: { origin } })

        onSuccess({
          fromGroup: unsignedData.fromGroup,
          toGroup: unsignedData.toGroup,
          unsignedTx: unsignedData.unsignedTx,
          txId: unsignedData.txId,
          signature: data.signature,
          gasAmount: unsignedData.gasAmount,
          gasPrice: BigInt(unsignedData.gasPrice)
        })
      }
    })

    return (
      <BottomModal2 modalId={id} contentVerticalGap>
        <ScreenSection>
          <Surface>
            <AssetsAmountsRows assetAmounts={txParams.assetAmounts} />

            <Row title={t('From')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            <Row title={t('To')} titleColor="secondary">
              <AddressBadge addressHash={txParams.toAddress} />
            </Row>

            <FeesRow fees={fees} />
          </Surface>
        </ScreenSection>

        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignTransferTxModal
