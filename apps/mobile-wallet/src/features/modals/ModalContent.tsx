import { ReactNode } from 'react'
import { FlatListProps, ScrollViewProps } from 'react-native'
import { FlatList as GHFlatList, ScrollView as GHScrollView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Screen, { ScreenProps } from '~/components/layout/Screen'
import { VERTICAL_GAP } from '~/style/globalStyle'

interface ModalContentBaseProps {
  onClose?: () => void
  isScrollable?: boolean
  children?: ReactNode
  verticalGap?: number | boolean
}

export interface ModalContentProps extends ModalContentBaseProps, ScrollViewProps {}

export interface ModalFlatListContentProps<T> extends ModalContentBaseProps, FlatListProps<T> {}

const scrollDefaultProps = { bounces: false, scrollEventThrottle: 16 }

// TODO: DELETE THIS COMPONENT ONCE BOTTOM MODAL IS REFACTORED

export const ModalContent = ({
  children,
  verticalGap,
  onLayout,
  contentContainerStyle,
  ...props
}: ModalContentProps) => {
  const insets = useSafeAreaInsets()

  return (
    <GHScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={getDefaultContentContainerStyle({
        verticalGap,
        contentContainerStyle: [contentContainerStyle, { paddingBottom: insets.bottom }]
      })}
      {...scrollDefaultProps}
      {...props}
      // TODO: Remove when react-native-gesture-handler is updated to 2.17.X or above (after expo-doctor allows it)
      hitSlop={undefined}
    >
      {children}
    </GHScrollView>
  )
}

export const ModalFlatListContent = <T,>({
  children,
  verticalGap,
  contentContainerStyle,
  ...props
}: ModalFlatListContentProps<T>) => {
  const insets = useSafeAreaInsets()

  return (
    <GHFlatList
      contentContainerStyle={getDefaultContentContainerStyle({
        verticalGap,
        contentContainerStyle: [contentContainerStyle, { paddingBottom: insets.bottom }]
      })}
      {...scrollDefaultProps}
      {...props}
      // TODO: Remove when react-native-gesture-handler is updated to 2.17.X or above (after expo-doctor allows it)
      hitSlop={undefined}
    >
      {children}
    </GHFlatList>
  )
}

export const Modal = ({ children, style, ...props }: ScreenProps) => {
  const insets = useSafeAreaInsets()

  return (
    <Screen style={[style, { paddingBottom: insets.bottom, backgroundColor: 'transparent' }]} {...props}>
      {children}
    </Screen>
  )
}

const getDefaultContentContainerStyle = ({ verticalGap, contentContainerStyle }: ModalContentProps) => [
  {
    gap: verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0,
    paddingTop: 10
  },
  contentContainerStyle
]
