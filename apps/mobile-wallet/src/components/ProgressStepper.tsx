import Lucide from '@react-native-vector-icons/lucide/static'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import { BORDER_RADIUS, BORDER_RADIUS_SMALL, DEFAULT_MARGIN } from '~/style/globalStyle'

export type StepState = 'pending' | 'active' | 'done' | 'error'

export const ProgressStepper = styled.View`
  background-color: ${({ theme }) => theme.bg.secondary};
  border-radius: ${BORDER_RADIUS}px;
  padding: ${DEFAULT_MARGIN}px;
`

interface ProgressStepProps {
  state: StepState
  title: string
  subtitle?: string
  details?: string
  isLast?: boolean
}

export const ProgressStep = ({ state, title, subtitle, details, isLast }: ProgressStepProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const [showDetails, setShowDetails] = useState(false)

  const nodeColors: Record<StepState, { bg: string; border: string }> = {
    done: { bg: theme.global.valid, border: theme.global.valid },
    error: { bg: theme.global.alert, border: theme.global.alert },
    active: { bg: theme.bg.highlight, border: theme.border.primary },
    pending: { bg: theme.bg.back1, border: theme.font.tertiary }
  }
  const { bg: nodeBg, border: nodeBorder } = nodeColors[state]

  let icon: ReactNode
  if (state === 'active') icon = <ActivityIndicator size={14} color={theme.font.secondary} />
  else if (state === 'done') icon = <Lucide name="check" size={14} color={theme.font.contrast} />
  else if (state === 'error') icon = <Lucide name="x" size={14} color={theme.font.contrast} />
  else icon = <PendingDot />

  return (
    <StepRow>
      <NodeColumn>
        <Node bgColor={nodeBg} borderColor={nodeBorder}>
          {icon}
        </Node>
        {!isLast && <Connector />}
      </NodeColumn>
      <TextColumn isLast={isLast}>
        <AppText semiBold color={state === 'pending' ? 'tertiary' : 'primary'}>
          {title}
        </AppText>
        <SubtitleSlot>
          {subtitle ? (
            <AppText size={12} color={state === 'error' ? 'alert' : 'secondary'}>
              {subtitle}
            </AppText>
          ) : null}
        </SubtitleSlot>

        {details ? (
          <>
            <DetailsToggle onPress={() => setShowDetails((v) => !v)} hitSlop={6}>
              <AppText size={12} color="accent" semiBold>
                {showDetails ? t('Hide details') : t('Show details')}
              </AppText>
            </DetailsToggle>
            {showDetails && (
              <DetailsBox>
                <AppText size={11} color="tertiary">
                  {details}
                </AppText>
              </DetailsBox>
            )}
          </>
        ) : null}
      </TextColumn>
    </StepRow>
  )
}

const StepRow = styled.View`
  flex-direction: row;
  gap: 12px;
`

const NodeColumn = styled.View`
  align-items: center;
`

const Node = styled.View<{ bgColor: string; borderColor: string }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  border: 1.5px solid ${({ borderColor }) => borderColor};
  background-color: ${({ bgColor }) => bgColor};
`

const PendingDot = styled.View`
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: ${({ theme }) => theme.font.tertiary};
`

const Connector = styled.View`
  flex: 1;
  width: 1.5px;
  min-height: 18px;
  background-color: ${({ theme }) => theme.border.primary};
  margin-vertical: 2px;
`

const TextColumn = styled.View<{ isLast?: boolean }>`
  flex: 1;
  gap: 2px;
  padding-bottom: ${({ isLast }) => (isLast ? 0 : DEFAULT_MARGIN)}px;
`

// Always reserve one line for the subtitle so the box height stays constant as steps change state.
const SubtitleSlot = styled.View`
  min-height: 16px;
`

const DetailsToggle = styled.Pressable`
  align-self: flex-start;
  margin-top: 6px;
`

const DetailsBox = styled.View`
  margin-top: 8px;
  padding: 10px;
  border-radius: ${BORDER_RADIUS_SMALL}px;
  background-color: ${({ theme }) => theme.bg.tertiary};
`
