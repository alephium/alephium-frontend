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

import { NavigationProp, useNavigation } from '@react-navigation/native'
import { Plus as PlusIcon } from 'lucide-react-native'
import { useTheme } from 'styled-components/native'

import RootStackParamList from '../navigation/rootStackRoutes'
import Button from './buttons/Button'

const AddressesScreenHeaderRight = () => {
  const theme = useTheme()
  const navigation = useNavigation<NavigationProp<RootStackParamList>>()

  return (
    <Button
      onPress={() => navigation.navigate('NewAddressScreen')}
      icon={<PlusIcon size={24} color={theme.global.accent} />}
      type="transparent"
    />
  )
}

export default AddressesScreenHeaderRight
