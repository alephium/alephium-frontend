import {
  signAndSubmitTxResultToSentTx,
  SignChainedTxModalProps,
  signChainedTxResultsToTxSubmittedResults,
  transactionSent
} from '@alephium/shared'
import { Link2Icon } from 'lucide-react'
import { useCallback } from 'react'
import { Fragment } from 'react/jsx-runtime'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import InfoBox from '@/components/InfoBox'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import { SignDeployContractTxModalContent } from '@/features/walletConnect/SignDeployContractTxModal'
import { SignExecuteScriptTxModalContent } from '@/features/walletConnect/SignExecuteScriptTxModal'
import { SignTransferTxModalContent } from '@/features/walletConnect/SignTransferTxModal'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import TransactionsSeparator from '@/features/walletConnect/TransactionsSeparator'
import { useAppDispatch } from '@/hooks/redux'
import { signer } from '@/signer'

const SignChainedTxModal = ({
  txParams,
  props,
  dAppUrl,
  onSuccess,
  ...rest
}: SignChainedTxModalProps & ModalBaseProp) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { isLedger } = useLedger()
  const { sendAnalytics } = useAnalytics()

  const handleSignAndSubmit = useCallback(async () => {
    if (isLedger) return

    const data = await signer.signAndSubmitChainedTx(txParams)
    const results = signChainedTxResultsToTxSubmittedResults(data, txParams)

    results.forEach((result) => {
      const sentTx = signAndSubmitTxResultToSentTx(result)
      dispatch(transactionSent(sentTx))
    })

    sendAnalytics({ event: 'Approved chained tx', props: { origin } })

    onSuccess(results)
  }, [dispatch, isLedger, onSuccess, sendAnalytics, txParams])

  return (
    <SignTxBaseModal
      title={t('Chained transactions')}
      sign={handleSignAndSubmit}
      type="CHAINED"
      isApproveButtonDisabled={isLedger}
      {...rest}
    >
      {isLedger ? (
        <InfoBox
          label={t('Not supported')}
          importance="warning"
          text={t('Ledger does not yet support chained transactions. We are working on it!')}
        />
      ) : (
        <SignChainedTxModalContent props={props} dAppUrl={dAppUrl} />
      )}
    </SignTxBaseModal>
  )
}

export default SignChainedTxModal

export const SignChainedTxModalContent = ({ props, dAppUrl }: Pick<SignChainedTxModalProps, 'props' | 'dAppUrl'>) => {
  const { t } = useTranslation()

  return props.map(({ txParams, unsignedData, type }, index) => {
    let content = null
    switch (type) {
      case 'TRANSFER': {
        const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)
        content = <SignTransferTxModalContent txParams={txParams} fees={fees} />
        break
      }
      case 'DEPLOY_CONTRACT': {
        const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)
        content = <SignDeployContractTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} />
        break
      }
      case 'EXECUTE_SCRIPT': {
        const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

        content = (
          <SignExecuteScriptTxModalContent
            txParams={txParams}
            fees={fees}
            dAppUrl={dAppUrl}
            unsignedData={unsignedData}
          />
        )
        break
      }
    }

    return (
      <Fragment key={index}>
        <Transaction>
          <TransactionTitle>{t('Transaction {{ number }}', { number: index + 1 })}</TransactionTitle>
          {content}
        </Transaction>
        {index !== props.length - 1 && <TransactionsSeparator Icon={ChainIcon} />}
      </Fragment>
    )
  })
}

const TransactionTitle = styled.div`
  text-align: center;
  margin-top: var(--spacing-2);
  font-size: 16px;
  font-weight: var(--fontWeight-bold);
`

const ChainIcon = styled(Link2Icon)`
  transform: rotate(90deg);
`

const Transaction = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  border-radius: var(--radius-big);
  padding: var(--spacing-4);
  border: 1px solid ${({ theme }) => theme.border.primary};
`
