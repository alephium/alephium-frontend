/*
Copyright 2018 - 2024 The Alephium Authors
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

import { getHumanReadableError } from '@alephium/shared'
import { MutableRefObject } from 'react'
import { FlatList, ScrollView } from 'react-native'
import Toast, { ToastShowParams } from 'react-native-toast-message'

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

export enum ToastDuration {
  SHORT = 3000,
  LONG = 10000
}

export const showToast = (params: ToastShowParams) => {
  Toast.show({
    position: 'bottom',
    bottomOffset: 50,
    visibilityTime: ToastDuration.LONG,
    onPress: Toast.hide,
    ...params
  })
}

export const showExceptionToast = (e: unknown, title: string) => {
  const humanReadableError = getHumanReadableError(e, '')

  showToast({
    type: 'error',
    text1: title,
    text2: humanReadableError ?? undefined,
    autoHide: false
  })
}
