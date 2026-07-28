import { AnalyticsEvent, GettingStartedItem } from '@alephium/shared'
import Ionicons from '@expo/vector-icons/Ionicons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import useGoToReceive from '~/features/receive/useGoToReceive'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { GettingStartedChecklist as Checklist } from '~/screens/Dashboard/useGettingStartedChecklist'
import { BORDER_RADIUS_BIG, DEFAULT_MARGIN } from '~/style/globalStyle'

interface GettingStartedChecklistProps {
  checklist: Checklist
}

const GettingStartedChecklist = ({ checklist }: GettingStartedChecklistProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const goToReceive = useGoToReceive()

  const { isVisible, items, completedCount, canDismiss, deactivate } = checklist

  useEffect(() => {
    if (isVisible) sendAnalytics({ event: AnalyticsEvent.GETTING_STARTED_SHOWN })
  }, [isVisible])

  if (!isVisible) return null

  const itemLabels: Record<GettingStartedItem, string> = {
    backup: t('Back up your recovery phrase'),
    receive_funds: t('Receive your first funds'),
    biometrics: t('Enable biometric unlock')
  }

  const handleItemPress = (item: GettingStartedItem) => {
    sendAnalytics({ event: AnalyticsEvent.GETTING_STARTED_ITEM_PRESSED, props: { checklist_item: item } })

    switch (item) {
      case 'backup':
        navigation.navigate('BackupMnemonicNavigation')
        break
      case 'receive_funds':
        goToReceive()
        break
      case 'biometrics':
        navigation.navigate('SettingsScreen')
        break
    }
  }

  const handleDismiss = () => {
    sendAnalytics({ event: AnalyticsEvent.GETTING_STARTED_DISMISSED })
    deactivate()
  }

  return (
    <Card>
      <Header>
        <AppText semiBold size={17}>
          {t('Getting started')}
        </AppText>
        {canDismiss && (
          <Pressable onPress={handleDismiss} hitSlop={12}>
            <Ionicons name="close" size={20} color={theme.font.tertiary} />
          </Pressable>
        )}
      </Header>

      <ProgressRow>
        <ProgressTrack>
          <ProgressFill style={{ width: `${(completedCount / items.length) * 100}%` }} />
        </ProgressTrack>
        <AppText color="secondary" size={13}>
          {t('{{ completed }}/{{ total }} complete', { completed: completedCount, total: items.length })}
        </AppText>
      </ProgressRow>

      {items.map(({ key, done }) => (
        <ItemRow key={key} onPress={done ? undefined : () => handleItemPress(key)} disabled={done}>
          <Ionicons
            name={done ? 'checkmark-circle' : 'ellipse-outline'}
            size={22}
            color={done ? theme.global.valid : theme.font.tertiary}
          />
          <ItemLabel done={done} size={16} medium>
            {itemLabels[key]}
          </ItemLabel>
          {!done && <Ionicons name="chevron-forward" size={18} color={theme.font.tertiary} />}
        </ItemRow>
      ))}
    </Card>
  )
}

export default GettingStartedChecklist

const Card = styled.View`
  margin: 0 ${DEFAULT_MARGIN}px;
  padding: 18px;
  gap: 14px;
  border-radius: ${BORDER_RADIUS_BIG}px;
  background-color: ${({ theme }) => theme.bg.secondary};
  border: 1px solid ${({ theme }) => theme.border.secondary};
`

const Header = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`

const ProgressRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`

const ProgressTrack = styled.View`
  flex: 1;
  height: 6px;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.bg.tertiary};
  overflow: hidden;
`

const ProgressFill = styled.View`
  height: 100%;
  border-radius: 100px;
  background-color: ${({ theme }) => theme.global.accent};
`

const ItemRow = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`

const ItemLabel = styled(AppText)<{ done: boolean }>`
  flex: 1;
  color: ${({ theme, done }) => (done ? theme.font.tertiary : theme.font.primary)};
  text-decoration-line: ${({ done }) => (done ? 'line-through' : 'none')};
`
