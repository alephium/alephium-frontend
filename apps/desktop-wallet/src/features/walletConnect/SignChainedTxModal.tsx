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
        content = <SignExecuteScriptTxModalContent txParams={txParams} fees={fees} dAppUrl={dAppUrl} />
        break
      }
    }

    return (
      <Fragment key={index}>
        <Title>{t('Transaction {{ number }}', { number: index + 1 })}</Title>
        {content}
        {index !== props.length - 1 && (
          <Separator>
            <SeparatorLine />
            <SeparatorIcon>
              <ChainIcon name="link-outline" size={18} />
            </SeparatorIcon>
          </Separator>
        )}
      </Fragment>
    )
  })
}

const Separator = styled.div`
  position: relative;
  display: flex;
  width: 100%;
  justify-content: center;
  padding: var(--spacing-2) 0;
`

const SeparatorLine = styled.div`
  height: 2px;
  background-color: ${({ theme }) => theme.border.primary};
  width: 100%;
`

const SeparatorIcon = styled.div`
  position: absolute;
  width: 100%;
`

const ChainIcon = styled(Link2Icon)`
  margin-left: auto;
  margin-right: auto;
  background-color: ${({ theme }) => theme.bg.background1};
  transform: rotate(90deg);
`

const Title = styled.div`
  text-align: center;
  margin-top: var(--spacing-2);
  font-size: 16px;
  font-weight: var(--fontWeight-bold);
`
