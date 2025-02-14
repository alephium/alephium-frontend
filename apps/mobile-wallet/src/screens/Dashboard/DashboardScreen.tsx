import { CURRENCIES } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled, { useTheme } from 'styled-components/native'

import AddressesTokensList from '~/components/AddressesTokensList'
import Amount from '~/components/Amount'
import ScreenAnimatedBackground from '~/components/animatedBackground/ScreenAnimatedBackground'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import { ScreenSection } from '~/components/layout/Screen'
import RefreshSpinner from '~/components/RefreshSpinner'
import RoundedCard from '~/components/RoundedCard'
import ActionCardBuyButton from '~/features/buy/ActionCardBuyButton'
import { openModal } from '~/features/modals/modalActions'
import ActionCardReceiveButton from '~/features/receive/ActionCardReceiveButton'
import SendButton from '~/features/send/SendButton'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import AlephiumLogo from '~/images/logos/AlephiumLogo'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { getIsNewWallet, storeIsNewWallet } from '~/persistent-storage/wallet'
import CameraScanButton from '~/screens/Dashboard/CameraScanButton'
import DashboardSecondaryButtons from '~/screens/Dashboard/DashboardSecondaryButtons'
import WalletSettingsButton from '~/screens/Dashboard/WalletSettingsButton'
import {
  makeSelectAddressesTokensWorth,
  selectDefaultAddress,
  selectTotalBalance
} from '~/store/addresses/addressesSelectors'
import { DEFAULT_MARGIN, HEADER_OFFSET_TOP, VERTICAL_GAP } from '~/style/globalStyle'

interface ScreenProps
  extends StackScreenProps<InWalletTabsParamList & ReceiveNavigationParamList, 'DashboardScreen'>,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const theme = useTheme()
  const dispatch = useAppDispatch()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector(selectAddessesTokensWorth)
  const addressesBalancesStatus = useAppSelector((s) => s.addresses.balancesStatus)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const needsBackupReminder = useAppSelector((s) => s.backup.needsReminder)
  const defaultAddressHash = useAppSelector(selectDefaultAddress).hash

  const { data: isNewWallet } = useAsyncData(getIsNewWallet)

  useEffect(() => {
    if (needsBackupReminder && !isMnemonicBackedUp && isNewWallet !== undefined) {
      dispatch(openModal({ name: 'BackupReminderModal', props: { isNewWallet } }))
    }
  }, [dispatch, isMnemonicBackedUp, isNewWallet, needsBackupReminder])

  useEffect(() => {
    if (!isNewWallet) return

    try {
      storeIsNewWallet(false)
    } catch (e) {
      console.error(e)
    }
  }, [isNewWallet])

  return (
    <DashboardScreenStyled
      refreshControl={<RefreshSpinner progressViewOffset={70} />}
      hasBottomBar
      verticalGap
      onScroll={screenScrollHandler}
      contentPaddingTop={60 + HEADER_OFFSET_TOP}
      headerScrollEffectOffset={30}
      headerOptions={{
        headerLeft: () => <CameraScanButton />,
        headerRight: () => <WalletSettingsButton />,
        headerTitle: () => <AlephiumLogo color={theme.font.primary} style={{ width: 40, height: 20 }} />,
        headerTitleScrolled: () => <Amount value={balanceInFiat} isFiat suffix={CURRENCIES[currency].symbol} semiBold />
      }}
      {...props}
    >
      <CardContainer style={{ marginTop: insets.top }}>
        <RoundedCardStyled>
          <ScreenAnimatedBackground height={400} scrollY={screenScrollY} isAnimated />
          <DashboardSecondaryButtons />
          <BalanceSummary />
        </RoundedCardStyled>
      </CardContainer>
      <ButtonsRowContainer>
        {totalBalance > BigInt(0) && <SendButton origin="dashboard" />}
        <ActionCardReceiveButton origin="dashboard" />
        <ActionCardBuyButton origin="dashboard" receiveAddressHash={defaultAddressHash} />
      </ButtonsRowContainer>

      <ScreenSection>
        <AddressesTokensList />
      </ScreenSection>

      {totalBalance === BigInt(0) && addressesBalancesStatus === 'initialized' && (
        <EmptyPlaceholder style={{ paddingHorizontal: DEFAULT_MARGIN, borderWidth: 0 }}>
          <AppText size={32}>🌈</AppText>
          <AppText color="secondary">{t('There is so much left to discover!')}</AppText>
          <AppText color="tertiary">{t('Start by adding funds to your wallet.')}</AppText>
        </EmptyPlaceholder>
      )}
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const DashboardScreenStyled = styled(BottomBarScrollScreen)`
  gap: 15px;
`

const CardContainer = styled.View`
  margin: 0 ${DEFAULT_MARGIN}px;
  flex: 1;
`

const RoundedCardStyled = styled(RoundedCard)`
  padding-top: ${VERTICAL_GAP}px;
`

const ButtonsRowContainer = styled(Animated.View)`
  flex-direction: row;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 ${DEFAULT_MARGIN}px;
`
