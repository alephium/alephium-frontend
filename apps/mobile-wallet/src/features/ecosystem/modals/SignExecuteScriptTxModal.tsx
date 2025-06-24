import { AssetAmount, transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { BuildTxResult, SignExecuteScriptTxParams, SignExecuteScriptTxResult } from '@alephium/web3'
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
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { signer } from '~/signer'

interface SignExecuteScriptTxModalProps extends SignTxModalCommonProps {
  txParams: SignExecuteScriptTxParams
  unsignedData: BuildTxResult<SignExecuteScriptTxResult>
  onSuccess: (signResult: SignExecuteScriptTxResult) => void
}

const SignExecuteScriptTxModal = memo(
  ({ txParams, unsignedData, dAppUrl, dAppIcon, origin, onError, onSuccess }: SignExecuteScriptTxModalProps) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const assetAmounts = calculateAssetAmounts(txParams)

    const { handleApprovePress, handleRejectPress, fees } = useSignModal({
      onError,
      unsignedData,
      sign: async () => {
        const data = await signer.signAndSubmitExecuteScriptTx(txParams)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: txParams.signerAddress,
            amount: txParams.attoAlphAmount ? txParams.attoAlphAmount.toString() : undefined,
            tokens: txParams.tokens
              ? txParams.tokens.map((token) => ({ id: token.id, amount: token.amount.toString() }))
              : undefined,
            timestamp: new Date().getTime(),
            status: 'sent',
            type: 'contract',
            toAddress: ''
          })
        )

        sendAnalytics({ event: 'Approved contract call', props: { origin } })

        onSuccess(data)
      }
    })

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <Surface>
            <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />

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
