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
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalCopyEncodedTextRow from '~/features/ecosystem/modals/SignModalCopyEncodedTextRow'
import SignModalDestinationDappRow from '~/features/ecosystem/modals/SignModalDestinationDappRow'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { SignExecuteScriptTxParamsWithAmounts } from '~/types/transactions'
import { getTransactionAssetAmounts } from '~/utils/transactions'

interface SignExecuteScriptTxModalProps extends SignTxModalCommonProps {
  txParams: SignExecuteScriptTxParamsWithAmounts
  unsignedData: n.BuildExecuteScriptTxResult
  onSuccess: (signResult: SignExecuteScriptTxResult) => void
}

const SignExecuteScriptTxModal = memo(
  ({ txParams, unsignedData, dAppUrl, dAppIcon, origin, onError, onSuccess }: SignExecuteScriptTxModalProps) => {
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
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <Surface>
            <SignModalAssetsAmountsRows assetAmounts={txParams.assetAmounts} />

            <Row title={t('From')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            {dAppUrl && <SignModalDestinationDappRow dAppUrl={dAppUrl} dAppIcon={dAppIcon} />}

            <SignModalCopyEncodedTextRow text={txParams.bytecode} title={t('Bytecode')} />

            <SignModalFeesRow fees={fees} />
          </Surface>
        </ScreenSection>
        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignExecuteScriptTxModal
