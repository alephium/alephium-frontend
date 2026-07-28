import { AnalyticsEvent, AnalyticsProps, getHumanReadableError, RejectionReason } from '@alephium/shared'
import { SignTxModalType } from '@alephium/shared/types'
import { getHostFromUrl } from '@alephium/shared/utils'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import useUnverifiedDappGuard from '~/features/ecosystem/unverifiedDapps/useUnverifiedDappGuard'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { showExceptionToast } from '~/utils/layout'

const signTxModalTypeToTxType: Record<SignTxModalType, AnalyticsProps['tx_type']> = {
  TRANSFER: 'transfer',
  DEPLOY_CONTRACT: 'deploy',
  EXECUTE_SCRIPT: 'contract_call',
  UNSIGNED_TX: 'unsigned',
  MESSAGE: 'message',
  CHAINED: 'chained',
  CONSOLIDATE: 'consolidate'
}

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

  // Swiping the modal away also rejects the request but does not come through here, so this is a
  // lower bound on rejections rather than an exact count.
  const reject = (rejection_reason: RejectionReason) => {
    sendAnalytics({
      event: AnalyticsEvent.TRANSACTION_REJECTED,
      props: { tx_type: signTxModalTypeToTxType[type], dapp_host: dAppUrl, rejection_reason }
    })

    onUserDismiss?.()
    dismissModal()
  }

  const handleApprovePress = () => {
    if (!dAppUrl) return approveAfterDappVerification()

    triggerUnverifiedDappGuard({
      dAppHost: getHostFromUrl(dAppUrl) ?? dAppUrl,
      orReject: () => reject('unverified_dapp'),
      onConfirm: () => {
        approveAfterDappVerification()
      }
    })
  }

  // Takes no arguments on purpose: it is passed straight to a Button's `onPress`, which would
  // otherwise supply the press event as the rejection reason.
  const handleRejectPress = () => reject('user_rejected')

  return {
    handleApprovePress,
    handleRejectPress
  }
}

export default useSignModal
