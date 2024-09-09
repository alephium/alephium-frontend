/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { colord } from 'colord'
import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components'

import DotIcon from '@/components/DotIcon'
import { useAppSelector } from '@/hooks/redux'
import { TranslationKey } from '@/types/i18next'

interface StepsProgressProps {
  currentStep: Step
  isContract?: boolean
  className?: string
}

export type Step = 'addresses' | 'build-tx' | 'info-check' | 'password-check' | 'tx-sent'

type StepStatus = 'completed' | 'active' | 'next'

const stepTitles: Record<Step, TranslationKey> = {
  addresses: 'Addresses',
  'build-tx': 'Assets',
  'info-check': 'Check',
  'password-check': 'Confirm',
  'tx-sent': 'Sent'
}

const dotSize = 13
const lineThickness = 2

const StepsProgress = ({ currentStep, isContract, className }: StepsProgressProps) => {
  const { t } = useTranslation()
  const { steps, getStepColors } = useStepsUI(currentStep)

  return (
    <div className={className}>
      {steps.map((step, index) => {
        const { text, dot, line } = getStepColors(step)
        const stepTitle = isContract && step === 'build-tx' ? 'Bytecode' : stepTitles[step]

        return (
          <Fragment key={step}>
            <StepIndicator>
              <DotIcon color={dot} strokeColor={text} size={dotSize} />
              <StepTitle style={{ color: text }}>{t(stepTitle)}</StepTitle>
            </StepIndicator>
            {index < steps.length - 1 && <Line color={line} />}
          </Fragment>
        )
      })}
    </div>
  )
}

const useStepsUI = (currentStep: Step) => {
  const theme = useTheme()
  const settings = useAppSelector((s) => s.settings)

  const nextColor = colord(theme.font.tertiary).alpha(0.3).toHex()

  const steps: Step[] = !settings.passwordRequirement
    ? ['addresses', 'build-tx', 'info-check', 'tx-sent']
    : ['addresses', 'build-tx', 'info-check', 'password-check', 'tx-sent']

  const getStepStatus = (step: Step): StepStatus =>
    steps.indexOf(step) < steps.indexOf(currentStep)
      ? 'completed'
      : steps.indexOf(step) === steps.indexOf(currentStep)
        ? 'active'
        : 'next'

  const textColor: Record<StepStatus, string> = {
    completed: colord(theme.global.accent).alpha(0.7).toHex(),
    active: theme.global.accent,
    next: nextColor
  }

  const dotFill: Record<StepStatus, string> = {
    completed: colord(theme.global.accent).alpha(0.7).toHex(),
    active: theme.bg.accent,
    next: 'transparent'
  }

  const line: Record<StepStatus, string> = {
    completed: colord(theme.global.accent).alpha(0.7).toHex(),
    active: nextColor,
    next: nextColor
  }

  const getStepColors = (step: Step) => {
    const status = getStepStatus(step)

    return {
      text: textColor[status],
      dot: dotFill[status],
      line: line[status]
    }
  }

  return { steps, getStepColors }
}

export default styled(StepsProgress)`
  padding: 15px 150px 30px 150px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.bg.background2};
  border-bottom: 1px solid ${({ theme }) => theme.border.primary};
  margin-top: -1px;
  z-index: 1;
`

const StepIndicator = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding-bottom: 20px;
`

const StepTitle = styled.span`
  font-size: 12px;
  position: absolute;
  top: 25px;
  transition: color 0.3s ease-out;
`

const Line = styled.div<{ color: string }>`
  flex-grow: 1;
  height: ${lineThickness}px;
  background-color: ${({ color }) => color};
  margin-top: ${dotSize / 2 - lineThickness / 2}px;
  transition: background-color 0.3s ease-out;
`
