import { SignUnsignedTxModalProps } from '@alephium/shared'
import { nodeTransactionReconstructDecodedUnsignedTxQuery, useTransactionAmountDeltas } from '@alephium/shared-react'
import { ALPH } from '@alephium/token-list'
import { explorer as e } from '@alephium/web3'
import { useQuery } from '@tanstack/react-query'
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

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <Surface>
            <Row title={t('Signing with')} titleColor="secondary">
              <AddressBadge addressHash={txParams.signerAddress} />
            </Row>

            <ReconstructedTransactionDetails unsignedData={unsignedData} txParams={txParams} />

            <SignModalCopyEncodedTextRow text={txParams.unsignedTx} title={t('Unsigned TX')} />
            <FeesRow unsignedData={unsignedData} />
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

const ReconstructedTransactionDetails = ({
  unsignedData,
  txParams
}: Pick<SignUnsignedTxModalProps, 'unsignedData' | 'txParams'>) => {
  const { data: tx } = useQuery(nodeTransactionReconstructDecodedUnsignedTxQuery({ decodedUnsignedTx: unsignedData }))

  if (!tx) return null

  return <DecodedTransactionDetails tx={tx} txParams={txParams} />
}

const DecodedTransactionDetails = ({
  tx,
  txParams
}: {
  tx: e.AcceptedTransaction
  txParams: SignUnsignedTxModalProps['txParams']
}) => {
  const { t } = useTranslation()
  const { alphAmount, tokenAmounts } = useTransactionAmountDeltas(tx, txParams.signerAddress)
  const assetAmounts = useMemo(
    () => (alphAmount !== BigInt(0) ? [{ id: ALPH.id, amount: alphAmount }, ...tokenAmounts] : tokenAmounts),
    [alphAmount, tokenAmounts]
  )

  return (
    <>
      <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />
      <Row title={t('From')} transparent>
        <TransactionOriginAddressesList tx={tx} referenceAddress={txParams.signerAddress} view="wallet" />
      </Row>
      <Row title={t('To')} transparent>
        <TransactionDestinationAddressesList tx={tx} referenceAddress={txParams.signerAddress} view="wallet" />
      </Row>
    </>
  )
}

const FeesRow = ({ unsignedData }: Pick<SignUnsignedTxModalProps, 'unsignedData'>) => {
  const fees = useMemo(
    () => BigInt(unsignedData.unsignedTx.gasAmount) * BigInt(unsignedData.unsignedTx.gasPrice),
    [unsignedData.unsignedTx.gasAmount, unsignedData.unsignedTx.gasPrice]
  )

  return <SignModalFeesRow fees={fees} />
}
