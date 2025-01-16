import { NavigationProp, useNavigation } from '@react-navigation/native'

import Button from '~/components/buttons/Button'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SendNavigationParamList } from '~/navigation/SendNavigation'

const WalletSettingsButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList | SendNavigationParamList>>()

  return <Button onPress={() => navigation.navigate('SettingsScreen')} iconProps={{ name: 'settings' }} squared />
}
export default WalletSettingsButton
