import { getHumanReadableError } from '@alephium/shared'
import { FlashListRef } from '@shopify/flash-list'
import { MutableRefObject } from 'react'
import { FlatList, ScrollView } from 'react-native'
import Toast, { ToastShowParams } from 'react-native-toast-message'

export const checkIfScrollView = (view: ScrollView | FlatList | FlashListRef<unknown>): view is ScrollView =>
  'scrollTo' in view

export const scrollScreenTo = (
  position: number,
  viewRef: MutableRefObject<ScrollView | FlatList | FlashListRef<unknown> | null>,
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
  LONG = 6000
}

export const showToast = (params: ToastShowParams) => {
  Toast.show({
    position: 'top',
    visibilityTime: ToastDuration.SHORT,
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
