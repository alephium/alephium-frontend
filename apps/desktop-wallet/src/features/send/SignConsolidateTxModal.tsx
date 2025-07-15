import { ConsolidationTxModalProps, selectAddressByHash } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { Codesandbox } from 'lucide-react'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import { sendSweepTransactions } from '@/api/transactions'
import Amount from '@/components/Amount'
import InfoBox from '@/components/InfoBox'
import { Section } from '@/components/PageComponents/PageContainers'
import Spinner from '@/components/Spinner'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { closeModal } from '@/features/modals/modalActions'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { HeaderContent, HeaderLogo } from '@/modals/CenteredModal'

const SignConsolidateTxModal = memo(
  ({ onSuccess, txParams, fees, ...props }: ModalBaseProp & ConsolidationTxModalProps) => {
    const { t } = useTranslation()
    const theme = useTheme()
    const signerAddress = useAppSelector((s) => selectAddressByHash(s, txParams.signerAddress))
    const { isLedger, onLedgerError } = useLedger()
    const { sendAnalytics } = useAnalytics()
    const dispatch = useAppDispatch()

    const handleSignAndSubmit = useCallback(async () => {
      if (!signerAddress) throw Error('Signer address not found')

      await sendSweepTransactions(txParams, isLedger, {
        signerIndex: signerAddress.index,
        onLedgerError
      })

      onSuccess()
      sendAnalytics({ event: 'Consolidated UTXOs' })
      dispatch(closeModal({ id: props.id }))
    }, [dispatch, isLedger, onLedgerError, onSuccess, props.id, sendAnalytics, signerAddress, txParams])

    return (
      <SignTxBaseModal
        title={t('Consolidate UTXOs')}
        sign={handleSignAndSubmit}
        type="CONSOLIDATE"
        onError={() => {}}
        {...props}
      >
        <HeaderContent>
          <HeaderLogo>
            <Codesandbox color={theme.global.accent} size="70%" strokeWidth={0.7} />
          </HeaderLogo>
          <Section>
            <InfoBox
              importance="accent"
              text={t(
                'It appears that your wallet has too many UTXOs to be able to send this transaction. Please, consolidate (merge) your UTXOs first. This will cost a small fee.'
              )}
            />
            <Fee>
              {t('Fee')}
              {fees ? <Amount tokenId={ALPH.id} value={fees} /> : <Spinner size="12px" />}
            </Fee>
          </Section>
        </HeaderContent>
      </SignTxBaseModal>
    )
  }
)

export default SignConsolidateTxModal

const Fee = styled.div`
  padding: 12px;
  display: flex;
  gap: 80px;
  width: 100%;
`
