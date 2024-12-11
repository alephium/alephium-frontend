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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import Badge from '~/components/Badge'
import Button from '~/components/buttons/Button'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import WalletConnectHeaderButton from '~/screens/Dashboard/WalletConnectHeaderButton'
import { showToast } from '~/utils/layout'

interface HeaderCenterContentProps {
  style?: StyleProp<ViewStyle>
}

const HeaderCenterContent = ({ style }: HeaderCenterContentProps) => {
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

  return (
    <Badge style={style}>
      <CenteredButtons>
        {networkStatus === 'offline' && (
          <Button onPress={showOfflineMessage} iconProps={{ name: 'cloud-off' }} variant="alert" squared />
        )}
        {!isMnemonicBackedUp && (
          <Button
            onPress={() => navigation.navigate('BackupMnemonicNavigation')}
            iconProps={{ name: 'alert-triangle' }}
            variant="alert"
            squared
          />
        )}
        {isWalletConnectEnabled && <WalletConnectHeaderButton />}
      </CenteredButtons>
    </Badge>
  )
}

export default memo(styled(HeaderCenterContent)`
  flex-direction: row;
  align-items: center;
  gap: 15px;
`)

const CenteredButtons = styled.View`
  flex: 1;
  flex-direction: row;
  justify-content: center;
  gap: 10px;
`
