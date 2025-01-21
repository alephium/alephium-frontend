import { NavigationProp, useNavigation } from '@react-navigation/native'

import Button from '~/components/buttons/Button'
import RootStackParamList from '~/navigation/rootStackRoutes'

const WalletSettingsButton = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return <Button onPress={() => navigation.navigate('SettingsScreen')} iconProps={{ name: 'settings' }} squared />
}
export default WalletSettingsButton
