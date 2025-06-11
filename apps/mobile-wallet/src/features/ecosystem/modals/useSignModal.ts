import { getHumanReadableError } from '@alephium/shared'
import { node as n } from '@alephium/web3'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import useModalDismiss from '~/features/modals/useModalDismiss'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { showExceptionToast } from '~/utils/layout'

interface UseSignModalProps {
  id: ModalInstance['id']
  sendTransaction: () => Promise<void>
  onReject: () => void
  onError: (message: string) => void
  unsignedData: n.BuildExecuteScriptTxResult | n.BuildDeployContractTxResult
}

const useSignModal = ({ id, unsignedData, sendTransaction, onReject, onError }: UseSignModalProps) => {
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { dismissModal, onDismiss } = useModalDismiss({ id, onUserDismiss: onReject })

  const handleApprovePress = () => {
    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () =>
        triggerFundPasswordAuthGuard({
          successCallback: async () => {
            dispatch(activateAppLoading(t('Approving')))

            try {
              await sendTransaction()
            } catch (error) {
              const message = 'Could not send transaction'
              const translatedMessage = t(message)

              onError(getHumanReadableError(error, translatedMessage))

              showExceptionToast(error, translatedMessage)
              sendAnalytics({ type: 'error', message })
            } finally {
              dispatch(deactivateAppLoading())
              dismissModal()
            }
          }
        })
    })
  }

  const handleRejectPress = () => {
    onReject()
    dismissModal()
  }

  const fees = BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)

  return {
    handleApprovePress,
    handleRejectPress,
    onDismiss,
    fees
  }
}

export default useSignModal
