import { NavigationProp, useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/native'

import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import WalletConnectButton from '~/screens/Dashboard/WalletConnectButton'
import { showToast } from '~/utils/layout'

const DashboardSecondaryButtons = () => {
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const networkStatus = useAppSelector((s) => s.network.status)
  const isWalletConnectEnabled = useAppSelector((s) => s.settings.walletConnect)
  const navigation = useNavigation<NavigationProp<RootStackParamList | SendNavigationParamList>>()
  const { t } = useTranslation()

  const showOfflineMessage = () =>
    showToast({
      text1: `${t('Reconnecting')}...`,
      text2: t('The app is offline and trying to reconnect. Please, check your network settings.'),
      type: 'info',
      onPress: () => navigation.navigate('SettingsScreen')
    })

  const areNoButtonsVisible = !isWalletConnectEnabled && isMnemonicBackedUp && networkStatus !== 'offline'
  const onlySideButtonVisible = isWalletConnectEnabled && isMnemonicBackedUp && networkStatus !== 'offline'

  if (areNoButtonsVisible) return null

  return (
    <DashboardSecondaryButtonsStyled style={{ height: onlySideButtonVisible ? 15 : 30 }}>
      <Buttons>
        {isWalletConnectEnabled && <WalletConnectButton />}
        {networkStatus === 'offline' && (
          <Button onPress={showOfflineMessage} iconProps={{ name: 'cloud-off' }} variant="alert" squared compact />
        )}
        {!isMnemonicBackedUp && (
          <Button
            onPress={() => navigation.navigate('BackupMnemonicNavigation')}
            iconProps={{ name: 'alert-triangle' }}
            variant="alert"
            squared
            compact
          />
        )}
      </Buttons>
    </DashboardSecondaryButtonsStyled>
  )
}

export default DashboardSecondaryButtons

const DashboardSecondaryButtonsStyled = styled.View`
  flex: 1;
  margin-top: -10px;
`

const Buttons = styled.View`
  flex-direction: row-reverse;
  justify-content: space-between;
  gap: 10px;
`
