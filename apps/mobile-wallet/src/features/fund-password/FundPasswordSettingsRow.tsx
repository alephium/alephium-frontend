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

import Ionicons from '@expo/vector-icons/Ionicons'
import { NavigationProp, useNavigation } from '@react-navigation/native'
import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { useAppSelector } from '~/hooks/redux'
import RootStackParamList from '~/navigation/rootStackRoutes'

const FundPasswordSettingsRow = memo(() => {
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const { t } = useTranslation()

  return (
    <Row
      title={t('Fund password')}
      subtitle={t('Enhance your security')}
      onPress={() =>
        !isMnemonicBackedUp
          ? navigation.navigate('BackupMnemonicNavigation')
          : isUsingFundPassword
            ? navigation.navigate('FundPasswordScreen', { newPassword: false })
            : undefined
      }
    >
      <FundPasswordRowContent />
    </Row>
  )
})

export default FundPasswordSettingsRow

const FundPasswordRowContent = memo(() => {
  const isUsingFundPassword = useAppSelector((s) => s.fundPassword.isActive)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()
  const theme = useTheme()

  if (isUsingFundPassword) {
    return <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
  }

  return (
    <Toggle
      value={false}
      onValueChange={() =>
        !isMnemonicBackedUp
          ? navigation.navigate('BackupMnemonicNavigation')
          : navigation.navigate('FundPasswordScreen', { newPassword: true })
      }
    />
  )
})
