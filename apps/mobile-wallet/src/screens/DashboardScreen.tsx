/*
Copyright 2018 - 2023 The Alephium Authors
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

import { AddressHash } from '@alephium/shared'
import { useHeaderHeight } from '@react-navigation/elements'
import { StackScreenProps } from '@react-navigation/stack'
import { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { Portal } from 'react-native-portalize'
import Animated, { useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated'
import { useTheme } from 'styled-components'
import styled from 'styled-components/native'

import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import ActiveNetworkBadge from '~/components/ActiveNetworkBadge'
import AddressesTokensList from '~/components/AddressesTokensList'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import DashboardHeaderActions from '~/components/DashboardHeaderActions'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import BottomModal from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import RefreshSpinner from '~/components/RefreshSpinner'
import WalletSwitchButton from '~/components/WalletSwitchButton'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { getIsNewWallet, storeIsNewWallet } from '~/persistent-storage/wallet'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'
import {
  selectAddressIds,
  selectTotalBalance,
  syncAddressesData,
  syncAddressesHistoricBalances
} from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface ScreenProps
  extends StackScreenProps<
      InWalletTabsParamList & ReceiveNavigationParamList & SendNavigationParamList,
      'DashboardScreen'
    >,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const headerHeight = useHeaderHeight()
  const walletName = useAppSelector((s) => s.wallet.name)
  const totalBalance = useAppSelector(selectTotalBalance)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const isLoading = useAppSelector((s) => s.addresses.loadingBalances)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)

  const [isBackupReminderModalOpen, setIsBackupReminderModalOpen] = useState(!isMnemonicBackedUp)
  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isNewWallet, setIsNewWallet] = useState(false)

  const buttonsRowStyle = useAnimatedStyle(() => ({
    height: withDelay(isLoading ? 100 : 800, withSpring(isLoading ? 0 : 65, defaultSpringConfiguration)),
    opacity: withDelay(isLoading ? 100 : 800, withSpring(isLoading ? 0 : 1, defaultSpringConfiguration))
  }))

  useEffect(() => {
    const initializeNewWalletFlag = async () => {
      setIsNewWallet(await getIsNewWallet())
      storeIsNewWallet(false)
    }

    initializeNewWalletFlag()
  }, [])

  const refreshData = () => {
    if (!isLoading) {
      dispatch(syncAddressesData(addressHashes))
      dispatch(syncAddressesHistoricBalances(addressHashes))
    }
  }

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

  return (
    <DashboardScreenStyled
      refreshControl={
        <RefreshSpinner refreshing={isLoading} onRefresh={refreshData} progressViewOffset={headerHeight || 170} />
      }
      hasBottomBar
      verticalGap
      headerOptions={{
        headerRight: () => <DashboardHeaderActions />,
        headerLeft: () => <WalletSwitchButton isLoading={isLoading} />,
        headerTitle: walletName,
        headerTitleRight: () => (
          <NetworkBadgeContainer>
            <Pressable onPress={() => setIsSwitchNetworkModalOpen(true)}>
              <ActiveNetworkBadge />
            </Pressable>
          </NetworkBadgeContainer>
        )
      }}
      {...props}
    >
      <BalanceAndButtons>
        <BalanceSummary dateLabel="VALUE TODAY" />
        {totalBalance > BigInt(0) && (
          <ButtonsRowContainer
            style={[
              buttonsRowStyle,
              {
                shadowColor: 'black',
                shadowOffset: { height: 5, width: 0 },
                shadowOpacity: theme.name === 'dark' ? 0.5 : 0.05,
                shadowRadius: 5
              }
            ]}
          >
            <Button
              onPress={handleSendPress}
              iconProps={{ name: 'arrow-up-outline' }}
              title="Send"
              variant="highlightedIcon"
              round
              short
              flex
            />
            <Button
              onPress={handleReceivePress}
              iconProps={{ name: 'arrow-down-outline' }}
              title="Receive"
              variant="highlightedIcon"
              round
              short
              flex
            />
          </ButtonsRowContainer>
        )}
      </BalanceAndButtons>
      <AddressesTokensList />
      {totalBalance === BigInt(0) && <EmptyPlaceholder>There is so much left to discover! 🌈</EmptyPlaceholder>}
      <Portal>
        <BottomModal
          isOpen={isBackupReminderModalOpen}
          onClose={() => setIsBackupReminderModalOpen(false)}
          Content={(props) => (
            <ModalContent verticalGap {...props}>
              <ScreenSection>
                <BottomModalScreenTitle>{isNewWallet ? 'Hello there! 👋' : "Let's verify! 😌"}</BottomModalScreenTitle>
              </ScreenSection>
              <ScreenSection>
                {isNewWallet ? (
                  <AppText color="secondary" size={18}>
                    The first and most important step is to{' '}
                    <AppText size={18} bold>
                      write down your secret recovery phrase
                    </AppText>{' '}
                    and store it in a safe place.
                  </AppText>
                ) : (
                  <AppText color="secondary" size={18}>
                    Have peace of mind by verifying that you{' '}
                    <AppText size={18} bold>
                      wrote your secret recovery phrase down
                    </AppText>{' '}
                    correctly.
                  </AppText>
                )}
              </ScreenSection>
              <ScreenSection>
                <Button
                  title="Let's do that!"
                  onPress={() => navigation.navigate('BackupMnemonicNavigation')}
                  variant="highlight"
                />
              </ScreenSection>
            </ModalContent>
          )}
        />

        <BottomModal
          isOpen={isSwitchNetworkModalOpen}
          onClose={() => setIsSwitchNetworkModalOpen(false)}
          Content={(props) => (
            <SwitchNetworkModal
              onClose={() => setIsSwitchNetworkModalOpen(false)}
              onCustomNetworkPress={() => navigation.navigate('CustomNetworkScreen')}
              {...props}
            />
          )}
        />
      </Portal>
    </DashboardScreenStyled>
  )
}

export default DashboardScreen

const DashboardScreenStyled = styled(BottomBarScrollScreen)`
  gap: 15px;
`

const BalanceAndButtons = styled.View`
  flex: 1;
`

const ButtonsRowContainer = styled(Animated.View)`
  margin: 0 ${DEFAULT_MARGIN}px 10px ${DEFAULT_MARGIN}px;
  flex-direction: row;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 10px;

  border-color: ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => theme.bg.primary};
`

const NetworkBadgeContainer = styled.View`
  flex-grow: 1;
  align-items: center;
  flex-direction: row;
  justify-content: flex-end;
`
