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

import { useNavigation } from '@react-navigation/native'
import { RefObject, useEffect } from 'react'
import { FlatList, ScrollView } from 'react-native'

import { scrollScreenTo } from '~/utils/layout'

const useScrollToTopOnFocus = (viewRef: RefObject<ScrollView> | RefObject<FlatList>) => {
  const navigation = useNavigation()
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      scrollScreenTo(0, viewRef)
    })

    return unsubscribe
  }, [navigation, viewRef])
}

export default useScrollToTopOnFocus
