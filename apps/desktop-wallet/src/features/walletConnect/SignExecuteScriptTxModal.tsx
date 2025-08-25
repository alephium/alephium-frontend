import {
  AssetAmount,
  isGrouplessAddress,
  selectAddressByHash,
  signAndSubmitTxResultToSentTx,
  SignExecuteScriptTxModalProps,
  transactionSent
} from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { SignExecuteScriptTxResult } from '@alephium/web3'
import { partition } from 'lodash'
import { ChevronsDown } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import Box from '@/components/Box'
import TokenAmountsBox from '@/components/TokenAmountsBox'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import CheckAddressesBox from '@/features/send/CheckAddressesBox'
import CheckWorthBox from '@/features/send/CheckWorthBox'
import AddressesDataRows from '@/features/transactionsDisplay/transactionDetailsModal/AddressesDataRows'
import TransactionSummary from '@/features/transactionsDisplay/TransactionSummary'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import TransactionsSeparator from '@/features/walletConnect/TransactionsSeparator'
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

  const handleSignAndSubmit = useCallback(async () => {
    if (!signerAddress) throw Error('Signer address not found')

    let result: SignExecuteScriptTxResult

    if (isLedger) {
      if (isGrouplessAddress(signerAddress)) throw Error('Groupless address not supported on Ledger')

      result = await signer.signAndSubmitExecuteScriptTxLedger(txParams, {
        signerIndex: signerAddress.index,
        signerKeyType: signerAddress.keyType,
        onLedgerError
      })
    } else {
      result = await signer.signAndSubmitExecuteScriptTx(txParams)
    }

    onSuccess(result)

    const sentTx = signAndSubmitTxResultToSentTx({ type: 'EXECUTE_SCRIPT', txParams, result })
    dispatch(transactionSent(sentTx))

    sendAnalytics({ event: 'Called smart contract' })
  }, [dispatch, isLedger, onLedgerError, onSuccess, sendAnalytics, signerAddress, txParams])

  const fees = useMemo(() => BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice), [unsignedData])

  return (
    <SignTxBaseModal title={t('Call contract')} sign={handleSignAndSubmit} type="EXECUTE_SCRIPT" {...props}>
      <SignExecuteScriptTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} unsignedData={unsignedData} />
    </SignTxBaseModal>
  )
}

export default SignExecuteScriptTxModal

export const SignExecuteScriptTxModalContent = ({
  txParams,
  fees,
  dAppUrl,
  unsignedData
}: Pick<SignExecuteScriptTxModalProps, 'txParams' | 'dAppUrl' | 'unsignedData'> & { fees: bigint }) => {
  const assetAmounts = useMemo(() => calculateAssetAmounts(txParams), [txParams])
  const { t } = useTranslation()

  return (
    <>
      <SectionTitle>{t('Sending')}</SectionTitle>
      {assetAmounts && assetAmounts.length > 0 && (
        <TokenAmountsBox assetAmounts={assetAmounts} hasBg hasHorizontalPadding shouldAddAlphForDust />
      )}
      <CheckAddressesBox fromAddressStr={txParams.signerAddress} dAppUrl={dAppUrl} hasBg hasHorizontalPadding />
      {assetAmounts && <CheckWorthBox assetAmounts={assetAmounts} fee={fees} hasBg hasBorder hasHorizontalPadding />}

      <TransactionsSeparator Icon={ChevronsDown} />

      <SectionTitle>{t('Simulated result')}</SectionTitle>
      <TransactionSummaryStyled tx={unsignedData} referenceAddress={txParams.signerAddress} hideType />
      <Box hasBg hasHorizontalPadding>
        <AddressesDataRows tx={unsignedData} referenceAddress={txParams.signerAddress} />
      </Box>
    </>
  )
}

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

const TransactionSummaryStyled = styled(TransactionSummary)`
  margin: 0;
  background-color: ${({ theme }) => theme.bg.tertiary};
`

const SectionTitle = styled.div`
  color: ${({ theme }) => theme.font.secondary};
  font-size: 14px;
  margin-top: 0;
  font-weight: var(--fontWeight-bold);
  text-align: center;
`
