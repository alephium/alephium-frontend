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
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Portal } from 'react-native-portalize'
import Animated, { useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated'
import styled, { useTheme } from 'styled-components/native'

import { defaultSpringConfiguration } from '~/animations/reanimated/reanimatedAnimations'
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
import BuyModal from '~/features/buy/BuyModal'
import FundPasswordReminderModal from '~/features/fund-password/FundPasswordReminderModal'
import { useAppSelector } from '~/hooks/redux'
import { useAsyncData } from '~/hooks/useAsyncData'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { getIsNewWallet, storeIsNewWallet } from '~/persistent-storage/wallet'
import HeaderButtons from '~/screens/Dashboard/HeaderButtons'
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
  const totalBalance = useAppSelector(selectTotalBalance)
  const addressHashes = useAppSelector(selectAddressIds) as AddressHash[]
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const needsFundPasswordReminder = useAppSelector((s) => s.fundPassword.needsReminder)
  const { t } = useTranslation()

  const [isFundPasswordReminderModalOpen, setIsFundPasswordReminderModalOpen] = useState(false)
  const [isBackupReminderModalOpen, setIsBackupReminderModalOpen] = useState(!isMnemonicBackedUp)
  const [isSwitchNetworkModalOpen, setIsSwitchNetworkModalOpen] = useState(false)
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false)
  const { data: isNewWallet } = useAsyncData(getIsNewWallet)

  const buttonsRowStyle = useAnimatedStyle(() => ({
    height: withDelay(800, withSpring(65, defaultSpringConfiguration)),
    opacity: withDelay(800, withSpring(1, defaultSpringConfiguration))
  }))

  useEffect(() => {
    if (isMnemonicBackedUp && needsFundPasswordReminder) {
      setIsFundPasswordReminderModalOpen(true)
    }
  }, [isMnemonicBackedUp, needsFundPasswordReminder])

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

  return (
    <DashboardScreenStyled
      refreshControl={<RefreshSpinner />}
      hasBottomBar
      verticalGap
      contrastedBg
      headerOptions={{
        headerRight: () => <HeaderButtons />,
        headerLeft: () => <WalletSwitchButton />
      }}
      {...props}
    >
      <BalanceAndButtons>
        <BalanceSummary dateLabel={t('VALUE TODAY')} />
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
            <Button onPress={handleSendPress} iconProps={{ name: 'send' }} variant="contrast" round flex short />
            <Button onPress={handleReceivePress} iconProps={{ name: 'download' }} variant="contrast" round flex short />
            {/*<Button
              onPress={() => setIsBuyModalOpen(true)}
              iconProps={{ name: 'credit-card' }}
              variant="contrast"
              round
              flex
              short
            />*/}
          </ButtonsRowContainer>
        )}
      </BalanceAndButtons>
      <AddressesTokensList />
      {totalBalance === BigInt(0) && addressesStatus === 'initialized' && (
        <EmptyPlaceholder>
          <AppText semiBold color="secondary">
            {t('There is so much left to discover!')} 🌈
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
                  {isNewWallet ? `${t('Hello there!')} 👋` : `${t("Let's verify!")} 😌`}
                </BottomModalScreenTitle>
              </ScreenSection>
              <ScreenSection>
                {isNewWallet ? (
                  <AppText color="secondary" size={18}>
                    <Trans
                      t={t}
                      i18nKey="backupModalMessage1"
                      components={{
                        1: <AppText size={18} bold />
                      }}
                    >
                      {
                        'The first and most important step is to <1>write down your secret recovery phrase</1> and store it in a safe place.'
                      }
                    </Trans>
                  </AppText>
                ) : (
                  <AppText color="secondary" size={18}>
                    <Trans
                      t={t}
                      i18nKey="backupModalMessage2"
                      components={{
                        1: <AppText size={18} bold />
                      }}
                    >
                      {
                        'Have peace of mind by verifying that you <1>wrote your secret recovery phrase down</1> correctly.'
                      }
                    </Trans>
                  </AppText>
                )}
              </ScreenSection>
              <ScreenSection>
                <Button
                  title={t("Let's do that!")}
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
      <FundPasswordReminderModal
        isOpen={isFundPasswordReminderModalOpen}
        onClose={() => setIsFundPasswordReminderModalOpen(false)}
      />
      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
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
  margin: 0 ${DEFAULT_MARGIN + 20}px;
  flex-direction: row;
  border-radius: 100px;
  align-items: center;
  justify-content: center;
  gap: 10px;
`
