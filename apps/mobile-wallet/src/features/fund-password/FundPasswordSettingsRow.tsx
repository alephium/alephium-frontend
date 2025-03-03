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
            ? navigation.navigate('FundPasswordScreen')
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
          : navigation.navigate('FundPasswordScreen')
      }
    />
  )
})
