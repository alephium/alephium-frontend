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

import { MutableRefObject } from 'react'
import { FlatList, ScrollView } from 'react-native'
import Toast, { ToastOptions } from 'react-native-root-toast'

export const checkIfScrollView = (view: ScrollView | FlatList): view is ScrollView => 'scrollTo' in view

export const scrollScreenTo = (
  position: number,
  viewRef: MutableRefObject<ScrollView | FlatList | null>,
  animated = false
) => {
  if (!viewRef?.current) return

  if (checkIfScrollView(viewRef.current)) {
    viewRef.current.scrollTo({ y: position, animated })
  } else {
    viewRef.current.scrollToOffset({ offset: position, animated })
  }
}

export const showToast = (text: string, settings?: Partial<ToastOptions>) => {
  Toast.show(text, {
    position: -100,
    shadow: false,
    ...settings
  })
}
