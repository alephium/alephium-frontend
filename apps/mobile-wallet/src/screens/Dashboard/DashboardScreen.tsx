import { CURRENCIES, selectDefaultAddressHash } from '@alephium/shared'
import { useFetchWalletBalancesAlph, useFetchWalletWorth } from '@alephium/shared-react'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import Amount from '~/components/Amount'
import AnimatedBackground from '~/components/animatedBackground/AnimatedBackground'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import RefreshSpinner from '~/components/RefreshSpinner'
import RoundedCard from '~/components/RoundedCard'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import { openModal } from '~/features/modals/modalActions'
import OfflineButton from '~/features/offline/OfflineButton'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { getIsNewWallet, storeIsNewWallet } from '~/persistent-storage/wallet'
import CameraScanButton from '~/screens/Dashboard/CameraScanButton'
import WalletConnectButton from '~/screens/Dashboard/WalletConnectButton'
import WalletSettingsButton from '~/screens/Dashboard/WalletSettingsButton'
import WalletTokensList from '~/screens/Dashboard/WalletTokensList'
import { DEFAULT_MARGIN, HEADER_OFFSET_TOP, VERTICAL_GAP } from '~/style/globalStyle'

const DashboardScreen = (props: BottomBarScrollScreenProps) => {
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()

  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const needsBackupReminder = useAppSelector((s) => s.backup.needsReminder)

  useEffect(() => {
    const isNewWallet = getIsNewWallet()

    if (needsBackupReminder && !isMnemonicBackedUp && isNewWallet !== undefined) {
      dispatch(openModal({ name: 'BackupReminderModal', props: { isNewWallet } }))
    }

    storeIsNewWallet(false)
  }, [dispatch, isMnemonicBackedUp, needsBackupReminder])

  return (
    <DashboardScreenStyled
      refreshControl={<RefreshSpinner progressViewOffset={100} />}
      hasBottomBar
      verticalGap
      contentPaddingTop={60 + HEADER_OFFSET_TOP}
      headerScrollEffectOffset={30}
      headerOptions={{
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight />,
        headerTitle: () => null,
        headerTitleScrolled: () => <WalletWorth />
      }}
      {...props}
    >
      <CardContainer style={{ marginTop: insets.top }}>
        <RoundedCard>
          <AnimatedBackground />
          <WalletBalanceSummary />
        </RoundedCard>
      </CardContainer>

      <ButtonsRowContainer>
        <WalletSendButton />
        <ActionCardReceiveButton origin="dashboard" />
        <WalletBuyButton />
      </ButtonsRowContainer>

      <ScreenSection>
        <WalletTokensList />
      </ScreenSection>

      <WalletEmptyPlaceholder />
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const WalletWorth = () => {
  const currency = useAppSelector((s) => s.settings.currency)
  const { data: worth } = useFetchWalletWorth()

  return <Amount value={worth} isFiat suffix={CURRENCIES[currency].symbol} semiBold />
}

const WalletSendButton = () => {
  const { data: alphBalances } = useFetchWalletBalancesAlph()

  if (alphBalances.availableBalance === '0') return null

  return <SendButton origin="dashboard" />
}

const WalletBuyButton = () => {
  const defaultAddressHash = useAppSelector(selectDefaultAddressHash)

  if (!defaultAddressHash) return null

  return <ActionCardBuyButton origin="dashboard" receiveAddressHash={defaultAddressHash} />
}

const WalletEmptyPlaceholder = () => {
  const { t } = useTranslation()
  const { data: alphBalances, isLoading } = useFetchWalletBalancesAlph()

  if (alphBalances.availableBalance !== '0' || isLoading) return null

  return (
    <EmptyPlaceholder hasHorizontalMargin>
      <AppText size={32}>🌈</AppText>
      <AppText color="secondary">{t('There is so much left to discover!')}</AppText>
      <AppText color="tertiary">{t('Start by adding funds to your wallet.')}</AppText>
    </EmptyPlaceholder>
  )
}

const WalletBalanceSummary = () => {
  const { t } = useTranslation()
  const { data: worth, isLoading, error } = useFetchWalletWorth()

  return (
    <BalanceSummary
      label={t('Wallet worth')}
      worth={worth}
      isLoading={isLoading}
      error={error}
      showDiscreetModeToggle
    />
  )
}

const HeaderLeft = () => {
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <HeaderButtonsContainer>
      <CameraScanButton />
      {!isMnemonicBackedUp && (
        <Button
          onPress={() => navigation.navigate('BackupMnemonicNavigation')}
          iconProps={{ name: 'alert-outline' }}
          variant="alert"
          squared
          compact
          style={{ marginRight: 10 }}
        />
      )}
    </HeaderButtonsContainer>
  )
}

const HeaderRight = () => (
  <HeaderButtonsContainer>
    <OfflineButton />
    <WalletConnectButton />
    <WalletSettingsButton />
  </HeaderButtonsContainer>
)

const HeaderButtonsContainer = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 20px;
`

const DashboardScreenStyled = styled(BottomBarScrollScreen)`
  gap: 15px;
`

const CardContainer = styled.View`
  margin: 0 ${DEFAULT_MARGIN}px;
  flex: 1;
`

const ButtonsRowContainer = styled(Animated.View)`
  flex-direction: row;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 ${DEFAULT_MARGIN}px;
`
