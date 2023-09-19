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

import { StackHeaderProps } from '@react-navigation/stack'

import Button from '~/components/buttons/Button'
import NavigationBaseHeader, { NavigationBaseHeaderProps } from '~/components/headers/NavigationBaseHeader'

export type NavigationStackHeaderCustomProps = StackHeaderProps & NavigationBaseHeaderProps

const NavigationStackHeader = ({ navigation, options, ...props }: NavigationStackHeaderCustomProps) => {
  const HeaderLeft = props.back ? (
    <Button onPress={navigation.goBack} iconProps={{ name: 'arrow-back-outline' }} round />
  ) : null

  return (
    <NavigationBaseHeader options={{ headerLeft: () => HeaderLeft, ...options }} showCompactComponents {...props} />
  )
}

export default NavigationStackHeader
