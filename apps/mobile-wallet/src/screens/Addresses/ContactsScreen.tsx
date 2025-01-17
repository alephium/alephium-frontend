import { Contact } from '@alephium/shared'
import { NavigationProp, useNavigation } from '@react-navigation/native'

import BottomBarScrollScreen from '~/components/layout/BottomBarScrollScreen'
import { TabBarPageScreenProps } from '~/components/layout/TabBarPager'
import RootStackParamList from '~/navigation/rootStackRoutes'
import ContactListScreenBase from '~/screens/ContactListScreenBase'

const ContactsScreen = ({ contentStyle, ...props }: TabBarPageScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <BottomBarScrollScreen contentPaddingTop={120} hasBottomBar {...props}>
      <ContactListScreenBase
        onContactPress={(contactId: Contact['id']) => navigation.navigate('ContactScreen', { contactId })}
        onNewContactPress={() => navigation.navigate('NewContactScreen')}
        style={contentStyle}
      />
    </BottomBarScrollScreen>
  )
}

export default ContactsScreen
