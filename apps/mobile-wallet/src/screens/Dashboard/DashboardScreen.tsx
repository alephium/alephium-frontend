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

import { AddressHash, CURRENCIES } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Animated from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import styled from 'styled-components/native'

import AddressesTokensList from '~/components/AddressesTokensList'
import Amount from '~/components/Amount'
import AnimatedBackground from '~/components/AnimatedBackground'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import { headerOffsetTop } from '~/components/headers/BaseHeader'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import RefreshSpinner from '~/components/RefreshSpinner'
import RoundedCard from '~/components/RoundedCard'
import { openModal } from '~/features/modals/modalActions'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { getIsNewWallet, storeIsNewWallet } from '~/persistent-storage/wallet'
import CameraScanButton from '~/screens/Dashboard/CameraScanButton'
import WalletSettingsButton from '~/screens/Dashboard/WalletSettingsButton'
import { makeSelectAddressesTokensWorth } from '~/store/addresses/addressesSelectors'
import { selectAddressIds, selectTotalBalance } from '~/store/addressesSlice'
import { DEFAULT_MARGIN, VERTICAL_GAP } from '~/style/globalStyle'

interface ScreenProps
  extends StackScreenProps<
      InWalletTabsParamList & ReceiveNavigationParamList & SendNavigationParamList,
      'DashboardScreen'
    >,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const currency = useAppSelector((s) => s.settings.currency)
  const totalBalance = useAppSelector(selectTotalBalance)
  const selectAddessesTokensWorth = useMemo(makeSelectAddressesTokensWorth, [])
  const balanceInFiat = useAppSelector(selectAddessesTokensWorth)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const needsBackupReminder = useAppSelector((s) => s.backup.needsReminder)

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

  const handleReceivePress = () => {
    if (addressHashes.length === 1) {
      navigation.navigate('ReceiveNavigation', {
        screen: 'QRCodeScreen',
        params: { addressHash: addressHashes[0] }
      })
    } else {
      navigation.navigate('ReceiveNavigation')
    }
  }

  const handleSendPress = () => {
    if (addressHashes.length === 1) {
      navigation.navigate('SendNavigation', {
        screen: 'DestinationScreen',
        params: { fromAddressHash: addressHashes[0] }
      })
    } else {
      navigation.navigate('SendNavigation')
    }
  }

  const openBuyModal = () => dispatch(openModal({ name: 'BuyModal' }))

  return (
    <DashboardScreenStyled
      refreshControl={<RefreshSpinner progressViewOffset={70} />}
      hasBottomBar
      verticalGap
      onScroll={screenScrollHandler}
      contentPaddingTop={50 + headerOffsetTop}
      headerScrollEffectOffset={30}
      headerOptions={{
        headerLeft: () => <CameraScanButton />,
        headerTitle: () => <Amount value={balanceInFiat} isFiat suffix={CURRENCIES[currency].symbol} semiBold />,
        headerRight: () => <WalletSettingsButton />
      }}
      {...props}
    >
      <CardContainer style={{ marginTop: insets.top }}>
        <RoundedCard>
          <AnimatedBackground height={400} scrollY={screenScrollY} isAnimated />
          <BalanceSummary dateLabel={t('VALUE TODAY')} />
          {totalBalance > BigInt(0) && (
            <ButtonsRowContainer>
              <>
                <Button onPress={handleSendPress} iconProps={{ name: 'send' }} variant="contrast" squared flex short />
                <Button
                  onPress={handleReceivePress}
                  iconProps={{ name: 'download' }}
                  variant="contrast"
                  squared
                  flex
                  short
                />
                <Button
                  onPress={openBuyModal}
                  iconProps={{ name: 'credit-card' }}
                  variant="contrast"
                  squared
                  flex
                  short
                />
              </>
            </ButtonsRowContainer>
          )}
        </RoundedCard>
      </CardContainer>
      <AddressesTokensList />
      {totalBalance === BigInt(0) && addressesStatus === 'initialized' && (
        <EmptyPlaceholder style={{ marginHorizontal: DEFAULT_MARGIN }}>
          <AppText size={28}>🌈</AppText>
          <AppText color="secondary">{t('There is so much left to discover!')}</AppText>
          <AppText color="tertiary">{t('Start by adding funds to your wallet.')}</AppText>
          <EmptyWalletActionButtons>
            <Button
              title={t('Receive')}
              onPress={handleReceivePress}
              iconProps={{ name: 'download' }}
              variant="contrast"
              squared
              short
            />
            <Button
              title={t('Buy')}
              onPress={openBuyModal}
              iconProps={{ name: 'credit-card' }}
              variant="contrast"
              squared
              short
            />
          </EmptyWalletActionButtons>
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
`

const ButtonsRowContainer = styled(Animated.View)`
  flex-direction: row;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  gap: 10px;
`

const EmptyWalletActionButtons = styled.View`
  gap: ${VERTICAL_GAP / 2}px;
  margin-top: ${VERTICAL_GAP}px;
`
