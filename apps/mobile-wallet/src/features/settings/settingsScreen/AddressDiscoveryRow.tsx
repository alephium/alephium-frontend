import Ionicons from '@expo/vector-icons/Ionicons'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import Row from '~/components/Row'
import RootStackParamList from '~/navigation/rootStackRoutes'

const AddressDiscoveryRow = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()

  const openAddressDiscoveryScreen = () => navigation.navigate('AddressDiscoveryScreen')

  return (
    <Row onPress={openAddressDiscoveryScreen} title={t('Scan for active addresses')}>
      <Ionicons name="chevron-forward-outline" size={16} color={theme.font.primary} />
    </Row>
  )
}

export default AddressDiscoveryRow
