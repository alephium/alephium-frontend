import { transactionSent } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import {
  binToHex,
  contractIdFromAddress,
  node as n,
  SignDeployContractTxParams,
  SignDeployContractTxResult
} from '@alephium/web3'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { signAndSendTransaction } from '~/api/transactions'
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
import { SignTxModalCommonProps } from '~/features/ecosystem/modals/SignTxModalTypes'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useAppDispatch } from '~/hooks/redux'

interface SignDeployContractTxModalProps extends SignTxModalCommonProps {
  txParams: SignDeployContractTxParams
  unsignedData: n.BuildDeployContractTxResult
  onSuccess: (signResult: SignDeployContractTxResult) => void
}

const SignDeployContractTxModal = memo(
  ({ txParams, unsignedData, dAppUrl, dAppIcon, origin, onError, onSuccess }: SignDeployContractTxModalProps) => {
    const dispatch = useAppDispatch()
    const { t } = useTranslation()

    const { handleApprovePress, handleRejectPress, fees } = useSignModal({
      onError,
      unsignedData,
      sign: async () => {
        const data = await signAndSendTransaction(txParams.signerAddress, unsignedData.txId, unsignedData.unsignedTx)

        dispatch(
          transactionSent({
            hash: data.txId,
            fromAddress: txParams.signerAddress,
            timestamp: new Date().getTime(),
            status: 'sent',
            type: 'contract',
            toAddress: ''
          })
        )

        sendAnalytics({ event: 'Approved contract deployment', props: { origin } })

        onSuccess({
          groupIndex: unsignedData.fromGroup,
          unsignedTx: unsignedData.unsignedTx,
          txId: unsignedData.txId,
          signature: data.signature,
          contractAddress: unsignedData.contractAddress,
          contractId: binToHex(contractIdFromAddress(unsignedData.contractAddress)),
          gasAmount: unsignedData.gasAmount,
          gasPrice: BigInt(unsignedData.gasPrice)
        })
      }
    })

    return (
      <BottomModal2 contentVerticalGap>
        <ScreenSection>
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
        </ScreenSection>
        <SignTxModalFooterButtonsSection onReject={handleRejectPress} onApprove={handleApprovePress} />
      </BottomModal2>
    )
  }
)

export default SignDeployContractTxModal
