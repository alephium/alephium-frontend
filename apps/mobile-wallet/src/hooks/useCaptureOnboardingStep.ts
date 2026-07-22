import { AnalyticsEvent, OnboardingStep } from '@alephium/shared'
import { useEffect } from 'react'

import { sendAnalytics } from '~/analytics'
import { useAppSelector } from '~/hooks/redux'

const useCaptureOnboardingStep = (step: OnboardingStep) => {
  const method = useAppSelector((s) => s.walletGeneration.method)

  useEffect(() => {
    sendAnalytics({ event: AnalyticsEvent.ONBOARDING_STEP_VIEWED, props: { step, method: method ?? undefined } })
  }, [method, step])
}

export default useCaptureOnboardingStep
