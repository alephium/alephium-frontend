import {
  AssetAmount,
  isGrouplessKeyType,
  selectAddressByHash,
  SignExecuteScriptTxModalProps,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { partition } from 'lodash'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import BytecodeExpandableSection from '@/features/send/BytecodeExpandableSection'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckAmountsBox from '@/features/send/CheckAmountsBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { signer } from '@/signer'

const SignExecuteScriptTxModal = ({
  txParams,
  unsignedData,
  dAppUrl,
  onSuccess,
  ...props
}: SignExecuteScriptTxModalProps & ModalBaseProp) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { isLedger, onLedgerError } = useLedger()
  const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
  const { sendAnalytics } = useAnalytics()

  const assetAmounts = useMemo(() => calculateAssetAmounts(txParams), [txParams])
  const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

  const onSignAndSubmit = useCallback(async () => {
    if (!signerAddress) throw Error('Signer address not found')

    let result: SignExecuteScriptTxResult

    if (isLedger) {
      if (isGrouplessKeyType(signerAddress.keyType)) throw Error('Groupless address not supported on Ledger')

      result = await signer.signAndSubmitExecuteScriptTxLedger(txParams, {
        signerIndex: signerAddress.index,
        signerKeyType: signerAddress.keyType ?? 'default',
        onLedgerError
      })
    } else {
      result = await signer.signAndSubmitExecuteScriptTx(txParams)
    }

    onSuccess(result)

    dispatch(
      transactionSent({
        hash: result.txId,
        fromAddress: txParams.signerAddress,
        toAddress: '',
        amount: txParams.attoAlphAmount?.toString(),
        tokens: txParams.tokens
          ? txParams.tokens.map((token) => ({ id: token.id, amount: token.amount.toString() }))
          : undefined,
        timestamp: new Date().getTime(),
        type: 'contract',
        status: 'sent'
      })
    )

    sendAnalytics({ event: 'Called smart contract' })
  }, [dispatch, isLedger, onLedgerError, onSuccess, sendAnalytics, signerAddress, txParams])

  return (
    <SignTxBaseModal
      title={t('Call contract')}
      onSignAndSubmit={onSignAndSubmit}
      txParams={txParams}
      unsignedData={unsignedData}
      onSuccess={onSuccess}
      {...props}
    >
      {assetAmounts && <CheckAmountsBox assetAmounts={assetAmounts} hasBg hasHorizontalPadding />}
      <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={dAppUrl} hasBg hasHorizontalPadding />
      {assetAmounts && <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />}
      <BytecodeExpandableSection bytecode={txParams.bytecode} />
    </SignTxBaseModal>
  )
}

export default SignExecuteScriptTxModal

const calculateAssetAmounts = ({ tokens, attoAlphAmount }: SignExecuteScriptTxModalProps['txParams']) => {
  let assetAmounts: AssetAmount[] = []
  let allAlphAssets: AssetAmount[] = attoAlphAmount ? [{ id: ALPH.id, amount: BigInt(attoAlphAmount) }] : []

  if (tokens) {
    const assets = tokens.map((token) => ({ id: token.id, amount: BigInt(token.amount) }))
    const [alphAssets, tokenAssets] = partition(assets, (asset) => asset.id === ALPH.id)

    assetAmounts = tokenAssets
    allAlphAssets = [...allAlphAssets, ...alphAssets]
  }

  if (allAlphAssets.length > 0) {
    assetAmounts.push({
      id: ALPH.id,
      amount: allAlphAssets.reduce((total, asset) => total + (asset.amount ?? BigInt(0)), BigInt(0))
    })
  }

  return assetAmounts
}
