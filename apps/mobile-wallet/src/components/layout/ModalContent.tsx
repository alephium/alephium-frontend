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

import { ReactNode } from 'react'
import { FlatListProps, ScrollViewProps } from 'react-native'
import { FlatList as GHFlatList, ScrollView as GHScrollView } from 'react-native-gesture-handler'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Screen, { ScreenProps } from '~/components/layout/Screen'
import ScrollSection, { ScrollSectionProps } from '~/components/layout/ScrollSection'
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

export const ModalContent = ({
  children,
  verticalGap,
  onLayout,
  contentContainerStyle,
  ...props
}: ModalContentProps) => (
  <GHScrollView
    {...scrollDefaultProps}
    {...props}
    contentContainerStyle={getDefaultContentContainerStyle({ verticalGap, contentContainerStyle })}
  >
    {children}
  </GHScrollView>
)

export const ModalFlatListContent = <T,>({
  children,
  verticalGap,
  contentContainerStyle,
  ...props
}: ModalFlatListContentProps<T>) => (
  <GHFlatList
    contentContainerStyle={getDefaultContentContainerStyle({ verticalGap, contentContainerStyle })}
    {...scrollDefaultProps}
    {...props}
  >
    {children}
  </GHFlatList>
)

export const Modal = ({ children, style, ...props }: ScreenProps) => {
  const insets = useSafeAreaInsets()

  return (
    <Screen style={[style, { paddingBottom: insets.bottom, backgroundColor: 'transparent' }]} {...props}>
      {children}
    </Screen>
  )
}

export const ScrollModal = ({ children, style, ...props }: ScrollSectionProps) => {
  const insets = useSafeAreaInsets()

  return (
    <ScrollSection style={[style, { paddingBottom: insets.bottom, backgroundColor: 'transparent' }]} {...props}>
      {children}
    </ScrollSection>
  )
}

const getDefaultContentContainerStyle = ({ verticalGap, contentContainerStyle }: ModalContentProps) => [
  {
    gap: verticalGap ? (typeof verticalGap === 'number' ? verticalGap || 0 : VERTICAL_GAP) : 0,
    paddingTop: 10,
    paddingBottom: 20
  },
  contentContainerStyle
]
