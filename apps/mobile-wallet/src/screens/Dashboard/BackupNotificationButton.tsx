import { AnalyticsEvent } from '@alephium/shared'
import Ionicons from '@expo/vector-icons/Ionicons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { useIsWalletWatchOnly } from '~/features/watchOnlyWallet/useIsWalletWatchOnly'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

const RING_PAUSE = 3000

const BackupNotificationButton = () => {
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const isWatchOnly = useIsWalletWatchOnly()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  if (isWatchOnly || isMnemonicBackedUp) return null

  const handlePress = () => {
    sendAnalytics({ event: AnalyticsEvent.BACKUP_NOTIFICATION_PRESSED })
    navigation.navigate('BackupMnemonicNavigation')
  }

  return (
    <Container>
      <Button onPress={handlePress} customIcon={<RingingBell />} squared />
      <Badge>
        <BadgeText color="white" size={11} semiBold>
          1
        </BadgeText>
      </Badge>
    </Container>
  )
}

export default BackupNotificationButton

const RingingBell = () => {
  const theme = useTheme()
  const reducedMotion = useReducedMotion()
  const rotation = useSharedValue(0)

  useEffect(() => {
    if (reducedMotion) return

    rotation.value = withRepeat(
      withSequence(
        withTiming(-14, { duration: 70 }),
        withTiming(14, { duration: 140 }),
        withTiming(-10, { duration: 140 }),
        withTiming(10, { duration: 140 }),
        withTiming(-6, { duration: 120 }),
        withTiming(6, { duration: 120 }),
        withTiming(0, { duration: 80 }),
        withDelay(RING_PAUSE, withTiming(0, { duration: 0 }))
      ),
      -1
    )

    return () => cancelAnimation(rotation)
  }, [reducedMotion, rotation])

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotation.value}deg` }] }))

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="notifications-outline" size={20} color={theme.font.primary} />
    </Animated.View>
  )
}

const Container = styled.View`
  position: relative;
`

const Badge = styled.View`
  position: absolute;
  top: -3px;
  right: -3px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.global.accent};
  border: 2px solid ${({ theme }) => theme.bg.back1};
`

const BadgeText = styled(AppText)`
  line-height: 14px;
`
