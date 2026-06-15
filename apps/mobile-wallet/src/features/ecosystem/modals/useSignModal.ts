import { getHumanReadableError } from '@alephium/shared'
import { SignTxModalType } from '@alephium/shared/types'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { getHostFromUrl } from '~/features/ecosystem/ecosystemUtils'
import useUnverifiedDappGuard from '~/features/ecosystem/unverifiedDapps/useUnverifiedDappGuard'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { showExceptionToast } from '~/utils/layout'

interface UseSignModalProps {
  sign: () => Promise<void>
  onError: (message: string) => void
  type: SignTxModalType
  dAppUrl?: string
}

const useSignModal = ({ sign, onError, type, dAppUrl }: UseSignModalProps) => {
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { dismissModal, onUserDismiss } = useModalContext()
  const { triggerUnverifiedDappGuard } = useUnverifiedDappGuard()

  const approveAfterDappVerification = () => {
    triggerBiometricsAuthGuard({
      settingsToCheck: 'transactions',
      successCallback: () =>
        triggerFundPasswordAuthGuard({
          successCallback: async () => {
            dispatch(activateAppLoading(t('Approving')))

            try {
              await sign()
            } catch (error) {
              const message =
                type === 'UNSIGNED_TX'
                  ? 'Could not sign unsigned transaction'
                  : type === 'MESSAGE'
                    ? 'Could not sign message'
                    : 'Could not send transaction'
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

  const handleApprovePress = () => {
    if (!dAppUrl) return approveAfterDappVerification()

    triggerUnverifiedDappGuard({
      dAppHost: getHostFromUrl(dAppUrl) ?? dAppUrl,
      orReject: () => handleRejectPress(),
      onConfirm: () => {
        approveAfterDappVerification()
      }
    })
  }

  const handleRejectPress = () => {
    onUserDismiss?.()
    dismissModal()
  }

  return {
    handleApprovePress,
    handleRejectPress
  }
}

export default useSignModal
