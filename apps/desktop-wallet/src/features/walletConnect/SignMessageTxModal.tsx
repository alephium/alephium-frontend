import { SignMessageTxModalProps } from '@alephium/shared'
import { AlertTriangle } from 'lucide-react'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import InfoBox from '@/components/InfoBox'
import { InputFieldsColumn } from '@/components/InputFieldsColumn'
import useAnalytics from '@/features/analytics/useAnalytics'
import { useLedger } from '@/features/ledger/useLedger'
import { ModalBaseProp } from '@/features/modals/modalTypes'
import SignTxBaseModal from '@/features/walletConnect/SignTxBaseModal'
import { signer } from '@/signer'

const SignMessageTxModal = memo(({ txParams, onSuccess, ...props }: ModalBaseProp & SignMessageTxModalProps) => {
  const { t } = useTranslation()
  const { isLedger } = useLedger()
  const { sendAnalytics } = useAnalytics()

  const handleSign = async () => {
    const result = await signer.signMessage(txParams)

    onSuccess(result)
    sendAnalytics({ event: 'Signed message' })
  }

  return (
    <SignTxBaseModal
      title={t('Sign Message')}
      sign={handleSign}
      isApproveButtonDisabled={isLedger}
      type="MESSAGE"
      {...props}
    >
      <InputFieldsColumn>
        <InfoBox label={t('Message')} text={txParams.message} />
      </InputFieldsColumn>

      {isLedger && (
        <InputFieldsColumn>
          <InfoBox
            text={t('Signing messages with Ledger is not supported.')}
            importance="warning"
            Icon={AlertTriangle}
          />
        </InputFieldsColumn>
      )}
    </SignTxBaseModal>
  )
})

export default SignMessageTxModal
