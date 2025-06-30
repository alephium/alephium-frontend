import { SignUnsignedTxModalProps } from '@alephium/shared'
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
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { signer } from '~/signer'

const SignUnsignedTxModal = memo(
  ({ txParams, unsignedData, origin, onError, onSuccess, submitAfterSign }: SignUnsignedTxModalProps) => {
    const { t } = useTranslation()

    const { handleApprovePress, handleRejectPress } = useSignModal({
      onError,
      type: 'UNSIGNED_TX',
      sign: async () => {
        onSuccess(
          submitAfterSign ? await signer.signAndSubmitUnsignedTx(txParams) : await signer.signUnsignedTx(txParams)
        )

        sendAnalytics({ event: 'Approved unsigned tx', props: { origin } })
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
              <AppText>{unsignedData.txId}</AppText>
            </Row>

            {/* TODO: Should show decoded unsigned data, see https://github.com/alephium/alephium-web3/blob/3cb9b2f5079b8cb41d284f81078bc2894880d143/packages/web3/src/signer/signer.ts#L186 */}
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
