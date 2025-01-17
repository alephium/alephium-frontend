import Ionicons from '@expo/vector-icons/Ionicons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StatusBar } from 'expo-status-bar'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components'

import FooterMenu from '~/components/footers/FooterMenu'
import EcosystemScreen from '~/features/ecosystem/EcosystemScreen'
import AddressesTabNavigation from '~/navigation/AddressesTabNavigation'
import ActivityScreen from '~/screens/ActivityScreen'
import DashboardScreen from '~/screens/Dashboard/DashboardScreen'
import NFTListScreen from '~/screens/NFTs/NFTListScreen'

export type InWalletTabsParamList = {
  DashboardScreen: undefined
  NFTListScreen: undefined
  AddressesTabNavigation: undefined
  ActivityScreen: undefined
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
              <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="NFTListScreen"
          component={NFTListScreen}
          options={{
            title: t('NFTs'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'image' : 'image-outline'} color={color} size={size} />
            )
          }}
        />
        <InWalletTabs.Screen
          name="ActivityScreen"
          component={ActivityScreen}
          options={{
            title: t('Activity'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'list' : 'list-outline'} color={color} size={size} />
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
