import {
  AssetAmount,
  getBaseAddressStr,
  getTxAddresses,
  signAndSubmitTxResultToSentTx,
  SignExecuteScriptTxModalProps,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import { ScreenSection } from '~/components/layout/Screen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import SignModalAssetsAmountsRows from '~/features/ecosystem/modals/SignModalAssetsAmountsRows'
import SignModalCopyEncodedTextRow from '~/features/ecosystem/modals/SignModalCopyEncodedTextRow'
import SignModalDestinationDappRow from '~/features/ecosystem/modals/SignModalDestinationDappRow'
import SignModalFeesRow from '~/features/ecosystem/modals/SignModalFeesRow'
import SignTxModalFooterButtonsSection from '~/features/ecosystem/modals/SignTxModalFooterButtonsSection'
import TransactionSeparator from '~/features/ecosystem/modals/TransactionSeparator'
import useSignModal from '~/features/ecosystem/modals/useSignModal'
import BottomModal2 from '~/features/modals/BottomModal2'
import {
  TransactionDestinationAddressesList,
  TransactionOriginAddressesList
} from '~/features/transactionsDisplay/InputsOutputsLists'
import { TransactionAmounts } from '~/features/transactionsDisplay/TransactionModal'
import { useAppDispatch } from '~/hooks/redux'
import { signer } from '~/signer'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

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
          <SignExecuteScriptTxModalContent
            txParams={txParams}
            fees={fees}
            dAppUrl={dAppUrl}
            dAppIcon={dAppIcon}
            unsignedData={unsignedData}
          />
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
  dAppIcon,
  unsignedData
}: Pick<SignExecuteScriptTxModalProps, 'txParams' | 'dAppUrl' | 'dAppIcon' | 'unsignedData'> & { fees: bigint }) => {
  const { t } = useTranslation()

  const assetAmounts = calculateAssetAmounts(txParams)

  return (
    <>
      <Surface type="primary" withPadding style={{ marginTop: DEFAULT_MARGIN }}>
        <Surface>
          <AppText size={16} bold style={{ textAlign: 'center' }}>
            {t('Call contract')}
          </AppText>
          <SignModalAssetsAmountsRows assetAmounts={assetAmounts} />

          <Row title={t('Signing with')} titleColor="secondary">
            <AddressBadge addressHash={txParams.signerAddress} />
          </Row>

          {dAppUrl && <SignModalDestinationDappRow dAppUrl={dAppUrl} dAppIcon={dAppIcon} />}

          <SignModalCopyEncodedTextRow text={txParams.bytecode} title={t('Bytecode')} />

          <SignModalFeesRow fees={fees} />
        </Surface>
      </Surface>

      <TransactionSeparator />

      <SimulatedResult unsignedData={unsignedData} txParams={txParams} />
    </>
  )
}

const SimulatedResult = ({
  unsignedData,
  txParams
}: Pick<SignExecuteScriptTxModalProps, 'unsignedData' | 'txParams'>) => {
  const { t } = useTranslation()

  const isRelevant = useMemo(
    () => getTxAddresses(unsignedData).some((address) => getBaseAddressStr(address) === txParams.signerAddress),
    [unsignedData, txParams.signerAddress]
  )

  return (
    <Surface type="primary" withPadding>
      <Surface>
        <AppText size={16} bold style={{ textAlign: 'center' }}>
          {t('Simulated result')}
        </AppText>

        {isRelevant ? (
          <>
            {unsignedData.simulationResult.contractInputs &&
              unsignedData.simulationResult.contractInputs.length > 0 && (
                <Row title={t('From')} transparent>
                  <TransactionOriginAddressesList
                    tx={unsignedData}
                    referenceAddress={txParams.signerAddress}
                    view="wallet"
                  />
                </Row>
              )}
            {unsignedData.simulationResult.generatedOutputs &&
              unsignedData.simulationResult.generatedOutputs.length > 0 && (
                <Row title={t('To')} transparent>
                  <TransactionDestinationAddressesList
                    tx={unsignedData}
                    referenceAddress={txParams.signerAddress}
                    view="wallet"
                  />
                </Row>
              )}
            <TransactionAmounts tx={unsignedData} referenceAddress={txParams.signerAddress} isLast />
          </>
        ) : (
          <AppText style={{ textAlign: 'center', marginTop: DEFAULT_MARGIN }} color="secondary">
            {t('Nothing relevant to the signer address.')}
          </AppText>
        )}
      </Surface>
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
