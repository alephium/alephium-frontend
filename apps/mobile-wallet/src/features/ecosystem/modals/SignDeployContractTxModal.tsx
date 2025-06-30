import { signAndSubmitTxResultToSentTx, SignDeployContractTxModalProps, transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import AssetAmountWithLogo from '~/components/AssetAmountWithLogo'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalCopyEncodedTextRow from '~/features/ecosystem/modals/SignModalCopyEncodedTextRow'
import SignModalDestinationDappRow from '~/features/ecosystem/modals/SignModalDestinationDappRow'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'
import { signer } from '~/signer'

const SignDeployContractTxModal = memo(
  ({ txParams, unsignedData, dAppUrl, dAppIcon, origin, onError, onSuccess }: SignDeployContractTxModalProps) => {
    const dispatch = useAppDispatch()

    const { handleApprovePress, handleRejectPress } = useSignModal({
      onError,
      type: 'DEPLOY_CONTRACT',
      sign: async () => {
        const data = await signer.signAndSubmitDeployContractTx(txParams)

        const sentTx = signAndSubmitTxResultToSentTx({ txParams, result: data, type: 'DEPLOY_CONTRACT' })
        dispatch(transactionSent(sentTx))

        sendAnalytics({ event: 'Approved contract deployment', props: { origin } })

        onSuccess(data)
      }
    })

    const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
          <SignDeployContractTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} dAppIcon={dAppIcon} />
        </ScreenSection>
        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignDeployContractTxModal

export const SignDeployContractTxModalContent = ({
  txParams,
  fees,
  dAppUrl,
  dAppIcon
}: Pick<SignDeployContractTxModalProps, 'txParams' | 'dAppUrl' | 'dAppIcon'> & { fees: bigint }) => {
  const { t } = useTranslation()

  return (
    <Surface>
      <Row title={t('From')} titleColor="secondary">
        <AddressBadge addressHash={txParams.signerAddress} />
      </Row>

      {dAppUrl && <SignModalDestinationDappRow dAppUrl={dAppUrl} dAppIcon={dAppIcon} />}

      {!!txParams.initialAttoAlphAmount && (
        <Row title={t('Initial amount')} titleColor="secondary">
          <AssetAmountWithLogo assetId={ALPH.id} amount={BigInt(txParams.initialAttoAlphAmount)} fullPrecision />
        </Row>
      )}

      {!!txParams.issueTokenAmount && (
        <Row title={t('Issue token amount')} titleColor="secondary">
          <AppText>{txParams.issueTokenAmount.toString()}</AppText>
        </Row>
      )}

      <SignModalCopyEncodedTextRow text={txParams.bytecode} title={t('Bytecode')} />

      <SignModalFeesRow fees={fees} />
    </Surface>
  )
}
