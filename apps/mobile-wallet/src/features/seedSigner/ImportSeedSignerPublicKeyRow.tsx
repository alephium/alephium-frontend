import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Row from '~/components/Row'
import RootStackParamList from '~/navigation/rootStackRoutes'

const ImportWatchOnlyWalletRow = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const openSeedSignerScreen = () => navigation.navigate('SeedSignerScreen')

  return (
    <Row
      onPress={openSeedSignerScreen}
      title={t('Import SeedSigner public key')}
      subtitle={t('Temporarily import public keys from SeedSigner to build and broadcast transactions.')}
      isLast
    >
      <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
    </Row>
  )
}

export default ImportWatchOnlyWalletRow
