import {
  getHumanReadableError,
  SignDeployContractTxModalProps,
  SignExecuteScriptTxModalProps,
  SignMessageTxModalProps,
  SignTransferTxModalProps,
  SignUnsignedTxModalProps
} from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import useFundPasswordGuard from '~/features/fund-password/useFundPasswordGuard'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch } from '~/hooks/redux'
import { useBiometricsAuthGuard } from '~/hooks/useBiometrics'
import { showExceptionToast } from '~/utils/layout'

type UnsignedTxData =
  | SignExecuteScriptTxModalProps['unsignedData']
  | SignDeployContractTxModalProps['unsignedData']
  | SignTransferTxModalProps['unsignedData']
  | SignUnsignedTxModalProps['unsignedData']
  | SignMessageTxModalProps['unsignedData']

type TxResultsWithGas =
  | SignExecuteScriptTxModalProps['unsignedData']
  | SignDeployContractTxModalProps['unsignedData']
  | SignTransferTxModalProps['unsignedData']

type BaseSignModalReturn = {
  handleApprovePress: () => void
  handleRejectPress: () => void
}

type SignModalReturn<T extends UnsignedTxData> = T extends TxResultsWithGas
  ? BaseSignModalReturn & { fees: bigint }
  : BaseSignModalReturn

interface UseSignModalProps<T extends UnsignedTxData> {
  sign: () => Promise<void>
  onError: (message: string) => void
  unsignedData: T
}

const useSignModal = <T extends UnsignedTxData>({
  unsignedData,
  sign,
  onError
}: UseSignModalProps<T>): SignModalReturn<T> => {
  const { triggerBiometricsAuthGuard } = useBiometricsAuthGuard()
  const { triggerFundPasswordAuthGuard } = useFundPasswordGuard()
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const { dismissModal, onUserDismiss } = useModalContext()

  const handleApprovePress = () => {
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
                typeof unsignedData === 'string'
                  ? 'Could not sign message'
                  : hasGasProperties(unsignedData)
                    ? 'Could not send transaction'
                    : 'Could not sign unsigned transaction'
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
    onUserDismiss?.()
    dismissModal()
  }

  const baseReturn: BaseSignModalReturn = {
    handleApprovePress,
    handleRejectPress
  }

  if (hasGasProperties(unsignedData)) {
    return {
      ...baseReturn,
      fees: BigInt(unsignedData.gasAmount) * BigInt(unsignedData.gasPrice)
    } as SignModalReturn<T>
  }

  return baseReturn as SignModalReturn<T>
}

export default useSignModal

const hasGasProperties = (data: UnsignedTxData): data is TxResultsWithGas =>
  typeof data === 'object' && 'gasAmount' in data && 'gasPrice' in data
