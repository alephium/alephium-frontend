import { useTranslation } from 'react-i18next'

import { ProgressStep, ProgressStepper, StepState } from '~/components/ProgressStepper'
import { SwapConfirmationStatus } from '~/features/swap/hooks/useSwapConfirmation'
import { SwapExecution } from '~/features/swap/swapTypes'

interface SwapProgressStepperProps {
  execution: SwapExecution
  confirmation: SwapConfirmationStatus
}

const SwapProgressStepper = ({ execution, confirmation }: SwapProgressStepperProps) => {
  const { t } = useTranslation()

  const isSubmitted = execution.status === 'submitted'

  const submitState: StepState =
    execution.status === 'error' ? 'error' : execution.status === 'signing' ? 'active' : 'done'

  const confirmState: StepState = !isSubmitted
    ? 'pending'
    : confirmation === 'confirmed'
      ? 'done'
      : confirmation === 'reverted'
        ? 'error'
        : 'active'

  const confirmTitle =
    confirmState === 'done'
      ? t('Swap completed')
      : confirmState === 'error'
        ? t('Swap reverted')
        : t('Confirming transaction')

  const confirmSubtitle =
    confirmState === 'active'
      ? t('Waiting for network confirmation')
      : confirmState === 'error'
        ? t('The price moved beyond your slippage. Your funds were returned, minus the network fee.')
        : undefined

  return (
    <ProgressStepper>
      <ProgressStep
        state={submitState}
        title={t('Submitting swap')}
        subtitle={
          execution.status === 'error'
            ? execution.message
            : submitState === 'active'
              ? t('Sign to broadcast your transaction')
              : undefined
        }
        details={execution.status === 'error' ? execution.details : undefined}
      />
      <ProgressStep state={confirmState} title={confirmTitle} subtitle={confirmSubtitle} isLast />
    </ProgressStepper>
  )
}

export default SwapProgressStepper
