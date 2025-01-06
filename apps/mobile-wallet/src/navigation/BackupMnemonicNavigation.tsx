import { ParamListBase } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'

import ProgressHeader from '~/components/headers/ProgressHeader'
import { HeaderContextProvider, useHeaderContext } from '~/contexts/HeaderContext'
import BackupIntroScreen from '~/features/backup/backupScreens/BackupIntroScreen'
import VerificationSuccessScreen from '~/features/backup/backupScreens/VerificationSuccessScreen'
import VerifyMnemonicScreen from '~/features/backup/backupScreens/VerifyMnemonicScreen'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { SCREEN_OVERFLOW } from '~/style/globalStyle'

export interface BackupMnemonicNavigationParamList extends ParamListBase {
  BackupIntroScreen: undefined
  MnemonicScreen: undefined
  VerificationSuccessScreen: undefined
}

const BackupMnemonicStack = createStackNavigator<BackupMnemonicNavigationParamList>()

const BackupMnemonicNavigation = (props: StackScreenProps<RootStackParamList, 'BackupMnemonicNavigation'>) => (
  <HeaderContextProvider>
    <BackupMnemonicProgressHeader />
    <BackupMnemonicStack.Navigator
      screenOptions={{ headerShown: false, cardStyle: { overflow: SCREEN_OVERFLOW } }}
      initialRouteName="BackupIntroScreen"
    >
      <BackupMnemonicStack.Screen name="BackupIntroScreen" component={BackupIntroScreen} />
      <BackupMnemonicStack.Screen name="VerifyMnemonicScreen" component={VerifyMnemonicScreen} />
      <BackupMnemonicStack.Screen name="VerificationSuccessScreen" component={VerificationSuccessScreen} />
    </BackupMnemonicStack.Navigator>
  </HeaderContextProvider>
)

const BackupMnemonicProgressHeader = () => {
  const { headerOptions, screenScrollY } = useHeaderContext()

  return (
    <ProgressHeader
      options={{ headerTitle: 'Backup', ...headerOptions }}
      titleAlwaysVisible
      workflow="backup"
      scrollY={screenScrollY}
    />
  )
}

export default BackupMnemonicNavigation
