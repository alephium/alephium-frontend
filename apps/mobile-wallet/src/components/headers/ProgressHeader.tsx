import { getFocusedRouteNameFromRoute, useRoute } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { Circle as ProgressBar } from 'react-native-progress'
import styled, { useTheme } from 'styled-components/native'

import BaseHeader, { BaseHeaderProps } from '~/components/headers/BaseHeader'
import { BackupMnemonicNavigationParamList } from '~/navigation/BackupMnemonicNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

export type ProgressWorkflow = 'send' | 'receive' | 'backup'

export interface ProgressHeaderProps extends BaseHeaderProps {
  workflow: ProgressWorkflow
}

const workflowSteps: Record<
  ProgressHeaderProps['workflow'],
  (keyof ReceiveNavigationParamList)[] | (keyof SendNavigationParamList)[] | (keyof BackupMnemonicNavigationParamList)[]
> = {
  receive: ['AddressScreen', 'QRCodeScreen'],
  send: ['DestinationScreen', 'OriginScreen', 'AddressTokensScreen', 'VerifyScreen'],
  backup: ['BackupIntroScreen', 'VerifyMnemonicScreen', 'VerificationSuccessScreen']
}

const ProgressHeader = ({ workflow, options, ...props }: ProgressHeaderProps) => {
  const theme = useTheme()
  const route = useRoute()

  const [progress, setProgress] = useState(0)

  const steps = workflowSteps[workflow]

  useEffect(() => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? steps[0]
    const currentStepIndex = steps.findIndex((step) => step === routeName)

    if (currentStepIndex !== -1) setProgress((currentStepIndex + 1) / steps.length)
  }, [route, steps])

  return (
    <BaseHeader
      options={{
        ...options,
        headerRight: () => (
          <HeaderRightContainer>{options.headerRight && options.headerRight({})}</HeaderRightContainer>
        ),
        headerTitleRight: () => (
          <ProgressBar
            progress={progress}
            color={progress === 1 ? theme.global.valid : theme.global.accent}
            unfilledColor={theme.border.primary}
            fill="transparent"
            borderWidth={0}
            size={24}
            style={{ marginBottom: -1 }}
            pointerEvents="none"
            thickness={3}
          />
        )
      }}
      {...props}
    />
  )
}

export default ProgressHeader

const HeaderRightContainer = styled.View`
  align-items: flex-end;
  justify-content: center;
`
