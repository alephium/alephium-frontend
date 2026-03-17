import Ionicons from '@expo/vector-icons/Ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import FooterMenu from '~/components/footers/FooterMenu'
import EcosystemScreen from '~/features/ecosystem/EcosystemScreen'
import AddressesTabNavigation from '~/navigation/AddressesTabNavigation'
import ActivityScreen from '~/screens/ActivityScreen'
import DashboardScreen from '~/screens/Dashboard/DashboardScreen'
import StakingScreen from '~/screens/Staking/StakingScreen'

export type InWalletTabsParamList = {
  DashboardScreen: undefined
  ActivityScreen: undefined
  StakingScreen: undefined
  AddressesTabNavigation: undefined
  EcosystemScreen: undefined
}

const InWalletTabs = createBottomTabNavigator<InWalletTabsParamList>()

const InWalletTabsNavigation = () => {
  const theme = useTheme()
  const { t } = useTranslation()

  return (
    <>
      <StatusBar style={theme.name === 'light' ? 'dark' : 'light'} />
      <InWalletTabs.Navigator
        tabBar={(props) => <FooterMenu {...props} />}
        screenOptions={{
          headerShown: false
        }}
      >
        <InWalletTabs.Screen
          name="DashboardScreen"
          component={DashboardScreen}
          options={{
            title: t('Overview'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="ActivityScreen"
          component={ActivityScreen}
          options={{
            title: t('Activity'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'time' : 'time-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="StakingScreen"
          component={StakingScreen}
          options={{
            title: t('Staking'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'layers' : 'layers-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="AddressesTabNavigation"
          component={AddressesTabNavigation}
          options={{
            title: t('Addresses'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'bookmark' : 'bookmark-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="EcosystemScreen"
          component={EcosystemScreen}
          options={{
            title: t('Ecosystem'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'planet' : 'planet-outline'} color={color} size={size} />
            )
          }}
        />
      </InWalletTabs.Navigator>
    </>
  )
}

export default InWalletTabsNavigation
