import { SignUnsignedTxModalProps } from '@alephium/shared'
import { useTransactionAmountDeltas } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalCopyEncodedTextRow from '~/features/ecosystem/modals/SignModalCopyEncodedTextRow'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import {
  TransactionDestinationAddressesList,
  TransactionOriginAddressesList
} from '~/features/transactionsDisplay/InputsOutputsLists'
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

    const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])
    const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(unsignedData, txParams.signerAddress)
    const assetAmounts = useMemo(
      () => (alphAmount !== BigInt(0) ? [{ id: ALPH.id, amount: alphAmount }, ...tokenAmounts] : tokenAmounts),
      [alphAmount, tokenAmounts]
    )

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <Surface>
            <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />
            <Row title={t('From')} transparent>
              <TransactionOriginAddressesList
                tx={unsignedData}
                referenceAddress={txParams.signerAddress}
                view="wallet"
              />
            </Row>
            <Row title={t('To')} transparent>
              <TransactionDestinationAddressesList
                tx={unsignedData}
                referenceAddress={txParams.signerAddress}
                view="wallet"
              />
            </Row>
            <Row title={t('Signing with')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            <SignModalCopyEncodedTextRow text={txParams.unsignedTx} title={t('Unsigned TX')} />
            <SignModalFeesRow fees={fees} />
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
