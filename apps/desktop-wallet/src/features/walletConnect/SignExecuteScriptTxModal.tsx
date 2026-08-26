import { AnalyticsEvent } from '@alephium/shared'
import { selectAddressByHash, signAndSubmitTxResultToSentTx, transactionSent } from '@alephium/shared/store'
import { calculateExecuteScriptTxAssetAmounts, getBaseAddressStr, getTxAddresses } from '@alephium/shared/transactions'
import { SignExecuteScriptTxModalProps } from '@alephium/shared/types'
import { isGrouplessAddress } from '@alephium/shared/utils'
import { SignExecuteScriptTxResult } from '@alephium/web3'
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
  origin,
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

    sendAnalytics({
      event: AnalyticsEvent.TRANSACTION_APPROVED,
      props: { origin, dapp_host: dAppUrl, tx_type: 'contract_call' }
    })
  }, [dAppUrl, dispatch, isLedger, onLedgerError, onSuccess, origin, sendAnalytics, signerAddress, txParams])

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
  const assetAmounts = useMemo(() => calculateExecuteScriptTxAssetAmounts(txParams), [txParams])
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
    <>
      <SectionTitle>{t('Simulated result')}</SectionTitle>
      {isRelevant ? (
        <>
          <TransactionSummaryStyled tx={unsignedData} referenceAddress={txParams.signerAddress} hideType skipCaching />
          <Box hasBg hasHorizontalPadding>
            <AddressesDataRows tx={unsignedData} referenceAddress={txParams.signerAddress} />
          </Box>
        </>
      ) : (
        <BoxStyled hasBg hasHorizontalPadding hasVerticalPadding hasBorder>
          {t('Nothing relevant to the signer address.')}
        </BoxStyled>
      )}
    </>
  )
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

const BoxStyled = styled(Box)`
  text-align: center;
`
