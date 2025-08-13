import {
  AssetAmount,
  signAndSubmitTxResultToSentTx,
  SignExecuteScriptTxModalProps,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalCopyEncodedTextRow from '~/features/ecosystem/modals/SignModalCopyEncodedTextRow'
import SignModalDestinationDappRow from '~/features/ecosystem/modals/SignModalDestinationDappRow'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { signer } from '~/signer'

const SignExecuteScriptTxModal = memo(
  ({ txParams, unsignedData, dAppUrl, dAppIcon, origin, onError, onSuccess }: SignExecuteScriptTxModalProps) => {
    const dispatch = useAppDispatch()

    const { handleApprovePress, handleRejectPress } = useSignModal({
      onError,
      type: 'EXECUTE_SCRIPT',
      sign: async () => {
        const data = await signer.signAndSubmitExecuteScriptTx(txParams)

        const sentTx = signAndSubmitTxResultToSentTx({ txParams, result: data, type: 'EXECUTE_SCRIPT' })
        dispatch(transactionSent(sentTx))

        sendAnalytics({ event: 'Approved contract call', props: { origin } })

        onSuccess(data)
      }
    })

    const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <SignExecuteScriptTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} dAppIcon={dAppIcon} />
        </ScreenSection>
        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignExecuteScriptTxModal

export const SignExecuteScriptTxModalContent = ({
  txParams,
  fees,
  dAppUrl,
  dAppIcon
}: Pick<SignExecuteScriptTxModalProps, 'txParams' | 'dAppUrl' | 'dAppIcon'> & { fees: bigint }) => {
  const { t } = useTranslation()

  const assetAmounts = calculateAssetAmounts(txParams)

  return (
    <Surface>
      <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />

      <Row title={t('From')} titleColor="secondary">
        <AddressBadge addressHash={txParams.signerAddress} />
      </Row>

      {dAppUrl && <SignModalDestinationDappRow dAppUrl={dAppUrl} dAppIcon={dAppIcon} />}

      <SignModalCopyEncodedTextRow text={txParams.bytecode} title={t('Bytecode')} />

      <SignModalFeesRow fees={fees} />
    </Surface>
  )
}

const calculateAssetAmounts = (txParams: SignExecuteScriptTxModalProps['txParams']) => {
  const assetAmounts = [] as AssetAmount[]

  if (txParams.attoAlphAmount) {
    assetAmounts.push({ id: ALPH.id, amount: BigInt(txParams.attoAlphAmount) })
  }

  if (txParams.tokens) {
    const tokens = txParams.tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
    assetAmounts.push(...tokens)
  }

  return assetAmounts
}
