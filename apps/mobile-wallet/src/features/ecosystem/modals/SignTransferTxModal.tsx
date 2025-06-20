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
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { SignTransferTxParamsSingleDestination } from '~/types/transactions'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface SignTransferTxModalProps extends SignTxModalCommonProps {
  txParams: SignTransferTxParamsSingleDestination
  unsignedData: n.BuildTransferTxResult
  onSuccess: (signResult: SignTransferTxResult) => void
}

const SignTransferTxModal = memo(({ txParams, unsignedData, origin, onError, onSuccess }: SignTransferTxModalProps) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()

  const { handleApprovePress, handleRejectPress, fees } = useSignModal({
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
    <BottomModal2 contentVerticalGap>
      <ScreenSection>
        <Surface>
          <SignModalAssetsAmountsRows assetAmounts={txParams.assetAmounts} />

          <Row title={t('From')} titleColor="secondary">
            <AddressBadge addressHash={txParams.signerAddress} />
          </Row>

          <Row title={t('To')} titleColor="secondary">
            <AddressBadge addressHash={txParams.toAddress} />
          </Row>

          <SignModalFeesRow fees={fees} />
        </Surface>
      </ScreenSection>

      <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
    </BottomModal2>
  )
})

export default SignTransferTxModal
