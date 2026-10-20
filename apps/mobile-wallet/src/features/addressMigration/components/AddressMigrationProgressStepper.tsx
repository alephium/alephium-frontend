import { formatAmountForDisplay } from '@alephium/shared/numbers'
import { useTranslation } from 'react-i18next'

import { ProgressStep, ProgressStepper, StepState } from '~/components/ProgressStepper'
import { AddressMigrationExecution, AddressMigrationStep } from '~/features/addressMigration/addressMigrationTypes'

const ORDER: AddressMigrationExecution['status'][] = ['preparing', 'signing', 'submitted', 'done']

interface AddressMigrationProgressStepperProps {
  execution: AddressMigrationExecution
}

const AddressMigrationProgressStepper = ({ execution }: AddressMigrationProgressStepperProps) => {
  const { t } = useTranslation()

  const error = execution.status === 'error' ? execution : undefined
  const fee = execution.status === 'signing' || execution.status === 'submitted' ? execution.fee : undefined
  const currentIndex = ORDER.indexOf(error ? error.failedAt : execution.status)

  const getStepState = (step: AddressMigrationStep): StepState => {
    const stepIndex = ORDER.indexOf(step)

    return stepIndex < currentIndex ? 'done' : stepIndex > currentIndex ? 'pending' : error ? 'error' : 'active'
  }

  const prepareState = getStepState('preparing')
  const moveState = getStepState('signing')
  const confirmState = getStepState('submitted')

  return (
    <ProgressStepper>
      <ProgressStep
        state={prepareState}
        title={t('Preparing migration')}
        subtitle={
          prepareState === 'error'
            ? error?.message
            : prepareState === 'active'
              ? t('Setting up your new address')
              : undefined
        }
        details={prepareState === 'error' ? error?.details : undefined}
      />
      <ProgressStep
        state={moveState}
        title={t('Moving your assets')}
        subtitle={
          moveState === 'error'
            ? error?.message
            : fee !== undefined
              ? t('Network fee: {{ fee }} ALPH', { fee: formatAmountForDisplay({ amount: fee }) })
              : undefined
        }
        details={moveState === 'error' ? error?.details : undefined}
      />
      <ProgressStep
        state={confirmState}
        title={confirmState === 'done' ? t('Migration completed') : t('Confirming transactions')}
        subtitle={
          confirmState === 'error'
            ? error?.message
            : confirmState === 'active'
              ? t('Waiting for network confirmation')
              : undefined
        }
        details={confirmState === 'error' ? error?.details : undefined}
        isLast
      />
    </ProgressStepper>
  )
}

export default AddressMigrationProgressStepper
