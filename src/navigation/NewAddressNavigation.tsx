/*
Copyright 2018 - 2022 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { ParamListBase } from '@react-navigation/native'
import { createStackNavigator, StackScreenProps } from '@react-navigation/stack'

import { NewAddressContextProvider } from '~/contexts/NewAddressContext'
import useBottomModalOptions from '~/hooks/layout/useBottomModalOptions'
import RootStackParamList from '~/navigation/rootStackRoutes'
import GroupSelectScreen from '~/screens/Address/GroupSelectScreen'
import NewAddressScreen from '~/screens/Address/NewAddressScreen'

export interface NewAddressNavigationParamList extends ParamListBase {
  NewAddressScreen: undefined
  GroupSelectScreen: undefined
}

const NewAddressStack = createStackNavigator<NewAddressNavigationParamList>()

const NewAddressNavigation = (props: StackScreenProps<RootStackParamList, 'NewAddressNavigation'>) => {
  const bottomModalOptions = useBottomModalOptions()

  return (
    <NewAddressContextProvider>
      <NewAddressStack.Navigator initialRouteName="NewAddressScreen">
        <NewAddressStack.Screen
          name="NewAddressScreen"
          component={NewAddressScreen}
          options={{ headerTitle: 'New address', headerBackTitleVisible: false }}
        />
        <NewAddressStack.Screen
          name="GroupSelectScreen"
          component={GroupSelectScreen}
          options={{ ...bottomModalOptions, title: 'Address group' }}
        />
      </NewAddressStack.Navigator>
    </NewAddressContextProvider>
  )
}

export default NewAddressNavigation
