import { WalletListEntry } from '@alephium/shared'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { memo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable } from 'react-native'
import styled, { useTheme } from 'styled-components/native'

import AppText from '~/components/AppText'
import Button from '~/components/buttons/Button'
import { ScreenSection } from '~/components/layout/Screen'
import { activateAppLoading, deactivateAppLoading } from '~/features/loader/loaderActions'
import BottomModal2 from '~/features/modals/BottomModal2'
import { useModalContext } from '~/features/modals/ModalContext'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'
import useWalletSwitch from '~/hooks/useWalletSwitch'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { showExceptionToast } from '~/utils/layout'

const WalletSwitchModal = memo(() => {
  const { t } = useTranslation()

  return (
    <BottomModal2 notScrollable title={t('Switch wallet')}>
      <ScreenSection verticalGap>
        <WalletSwitchModalContent />
      </ScreenSection>
    </BottomModal2>
  )
})

export default WalletSwitchModal

const WalletSwitchModalContent = () => {
  const walletList = useAppSelector((s) => s.wallets.list)
  const currentWalletId = useAppSelector((s) => s.wallet.id)
  const dispatch = useAppDispatch()
  const { dismissModal } = useModalContext()
  const { switchWallet } = useWalletSwitch()
  const { t } = useTranslation()
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()

  const handleWalletPress = useCallback(
    async (wallet: WalletListEntry) => {
      if (wallet.id === currentWalletId) {
        dismissModal()

        return
      }

      dispatch(activateAppLoading(t('Switching wallet')))

      try {
        await switchWallet(wallet.id)
      } catch (error) {
        showExceptionToast(error, t('Could not switch wallet'))
      }

      dispatch(deactivateAppLoading())
      dismissModal()
    },
    [currentWalletId, dispatch, dismissModal, switchWallet, t]
  )

  const handleAddWallet = useCallback(() => {
    dismissModal()
    navigation.navigate('LandingScreen', { isAddingWallet: true })
  }, [dismissModal, navigation])

  const handleWatchAddress = useCallback(() => {
    dismissModal()
    navigation.navigate('WatchOnlyAddressScreen')
  }, [dismissModal, navigation])

  return (
    <>
      {walletList.map((wallet) => (
        <WalletListItem
          key={wallet.id}
          wallet={wallet}
          isActive={wallet.id === currentWalletId}
          onPress={handleWalletPress}
        />
      ))}
      <Button title={t('Add wallet')} onPress={handleAddWallet} iconProps={{ name: 'add-outline' }} type="secondary" />
      <Button
        title={t('Watch address')}
        onPress={handleWatchAddress}
        iconProps={{ name: 'eye-outline' }}
        type="secondary"
      />
    </>
  )
}

interface WalletListItemProps {
  wallet: WalletListEntry
  isActive: boolean
  onPress: (wallet: WalletListEntry) => void
}

const WalletListItem = ({ wallet, isActive, onPress }: WalletListItemProps) => {
  const theme = useTheme()

  return (
    <WalletListItemStyled onPress={() => onPress(wallet)}>
      <WalletInfo>
        <WalletName semiBold color={isActive ? theme.global.accent : undefined}>
          {wallet.name}
        </WalletName>
        {wallet.type === 'watch-only' && <WalletTypeBadge color={theme.font.tertiary}>view-only</WalletTypeBadge>}
      </WalletInfo>
      {isActive && <ActiveIndicator color={theme.global.accent}>&#10003;</ActiveIndicator>}
    </WalletListItemStyled>
  )
}

const WalletListItemStyled = styled(Pressable)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.bg.secondary};
`

const WalletInfo = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

const WalletName = styled(AppText)`
  font-size: 16px;
`

const WalletTypeBadge = styled(AppText)`
  font-size: 12px;
`

const ActiveIndicator = styled(AppText)`
  font-size: 18px;
`
