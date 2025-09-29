import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Row from '~/components/Row'
import RootStackParamList from '~/navigation/rootStackRoutes'

const PublicKeysRow = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const openPublicKeysScreen = () => navigation.navigate('PublicKeysScreen')

  return (
    <Row onPress={openPublicKeysScreen} title={t('Get public keys')} isLast>
      <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
    </Row>
  )
}

export default PublicKeysRow
