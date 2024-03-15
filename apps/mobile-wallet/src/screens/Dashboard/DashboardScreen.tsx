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

import { AddressHash } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { AnimatePresence } from 'moti'
import { useEffect, useState } from 'react'
import { Pressable } from 'react-native'
import { Portal } from 'react-native-portalize'
import Animated, { useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
import ActiveNetworkBadge from '~/components/ActiveNetworkBadge'
import AddressesTokensList from '~/components/AddressesTokensList'
import AppText from '~/components/AppText'
import BalanceSummary from '~/components/BalanceSummary'
import Button from '~/components/buttons/Button'
import EmptyPlaceholder from '~/components/EmptyPlaceholder'
import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import BottomModal from '~/components/layout/BottomModal'
import { ModalContent } from '~/components/layout/ModalContent'
import { BottomModalScreenTitle, ScreenSection } from '~/components/layout/Screen'
import RefreshSpinner from '~/components/RefreshSpinner'
import WalletSwitchButton from '~/components/WalletSwitchButton'
import { useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { getIsNewWallet, storeIsNewWallet } from '~/persistent-storage/wallet'
import HeaderButtons from '~/screens/Dashboard/HeaderButtons'
import InitialDataLoader from '~/screens/Dashboard/InitialDataLoader'
import SwitchNetworkModal from '~/screens/SwitchNetworkModal'
import { selectAddressIds, selectTotalBalance } from '~/store/addressesSlice'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface ScreenProps
  extends StackScreenProps<
      InWalletTabsParamList & ReceiveNavigationParamList & SendNavigationParamList,
      'DashboardScreen'
    >,
    BottomBarScrollScreenProps {}

const DashboardScreen = ({ navigation, ...props }: ScreenProps) => {
  const theme = useTheme()
  const walletName = useAppSelector((s) => s.wallet.name)
  const totalBalance = useAppSelector(selectTotalBalance)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)

  const [isBackupReminderModalOpen, setIsBackupReminderModalOpen] = useState(!isMnemonicBackedUp)
  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isNewWallet, setIsNewWallet] = useState(false)
  const [isInitialDataLoaderVisible, setIsInitialDataLoaderVisible] = useState(addressesStatus === 'uninitialized')

  const buttonsRowStyle = useAnimatedStyle(() => ({
    height: withDelay(800, withSpring(65, defaultSpringConfiguration)),
    opacity: withDelay(800, withSpring(1, defaultSpringConfiguration))
  }))

  useEffect(() => {
    if (addressesStatus === 'initialized') {
      const timeoutId = setTimeout(() => setIsInitialDataLoaderVisible(false), 300)

      return () => clearTimeout(timeoutId)
    }
  }, [addressesStatus])

  useEffect(() => {
    const initializeNewWalletFlag = async () => {
      const isNew = await getIsNewWallet()

      if (isNew !== undefined) {
        setIsNewWallet(isNew)
        storeIsNewWallet(false)
      }
    }

    initializeNewWalletFlag()
  }, [])

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
    <>
      <AnimatePresence>{isInitialDataLoaderVisible && <InitialDataLoader />}</AnimatePresence>
      <DashboardScreenStyled
        refreshControl={<RefreshSpinner />}
        hasBottomBar
        verticalGap
        screenTitle={walletName}
        headerOptions={{
          headerRight: () => <HeaderButtons />,
          headerLeft: () => <WalletSwitchButton />,
          headerTitle: walletName
        }}
        TitleSideComponent={
          <NetworkBadgeContainer>
            <Pressable onPress={() => setIsSwitchNetworkModalOpen(true)}>
              <ActiveNetworkBadge />
            </Pressable>
          </NetworkBadgeContainer>
        }
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
        {totalBalance === BigInt(0) && (
          <EmptyPlaceholder>
            <AppText semiBold color="secondary">
              There is so much left to discover! 🌈
            </AppText>
          </EmptyPlaceholder>
        )}
        <Portal>
          <BottomModal
            isOpen={isBackupReminderModalOpen}
            onClose={() => setIsBackupReminderModalOpen(false)}
            Content={(props) => (
              <ModalContent verticalGap {...props}>
                <ScreenSection>
                  <BottomModalScreenTitle>
                    {isNewWallet ? 'Hello there! 👋' : "Let's verify! 😌"}
                  </BottomModalScreenTitle>
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
    </>
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
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`
