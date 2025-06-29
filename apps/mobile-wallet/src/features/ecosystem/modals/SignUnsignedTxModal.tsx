import { throttledClient } from '@alephium/shared'
import { node as n, SignUnsignedTxParams, SignUnsignedTxResult, transactionSign } from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalCopyEncodedTextRow from '~/features/ecosystem/modals/SignModalCopyEncodedTextRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { getAddressAsymetricKey } from '~/persistent-storage/wallet'

interface SignUnsignedTxModalProps extends SignTxModalCommonProps {
  txParams: SignUnsignedTxParams
  unsignedData: n.DecodeUnsignedTxResult
  submitAfterSign: boolean
  onSuccess: (signResult: SignUnsignedTxResult) => void
}

const SignUnsignedTxModal = memo(
  ({ txParams, unsignedData, origin, onError, onSuccess, submitAfterSign }: SignUnsignedTxModalProps) => {
    const { t } = useTranslation()

    const { handleApprovePress, handleRejectPress } = useSignModal({
      onError,
      unsignedData,
      sign: async () => {
        const signature = transactionSign(
          unsignedData.unsignedTx.txId,
          await getAddressAsymetricKey(txParams.signerAddress, 'private')
        )

        if (submitAfterSign)
          await throttledClient.node.transactions.postTransactionsSubmit({
            unsignedTx: txParams.unsignedTx,
            signature
          })

        sendAnalytics({ event: 'Approved unsigned tx', props: { origin } })

        onSuccess({
          ...unsignedData,
          signature,
          txId: unsignedData.unsignedTx.txId,
          gasAmount: unsignedData.unsignedTx.gasAmount,
          gasPrice: BigInt(unsignedData.unsignedTx.gasPrice),
          unsignedTx: txParams.unsignedTx
        })
      }
    })

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <Surface>
            <Row title={t('Signing with')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            <Row isVertical title={t('Unsigned TX ID')} titleColor="secondary">
              <AppText>{unsignedData.unsignedTx.txId}</AppText>
            </Row>

            <SignModalCopyEncodedTextRow text={txParams.unsignedTx} title={t('Unsigned TX')} />
          </Surface>
        </ScreenSection>

        <SignTxModalFooterButtonsSection
          onReject={handleRejectPress}
          onApprove={handleApprovePress}
          approveButtonTitle={!submitAfterSign ? t('Sign') : undefined}
        />
      </BottomModal2>
    )
  }
)

export default SignUnsignedTxModal
