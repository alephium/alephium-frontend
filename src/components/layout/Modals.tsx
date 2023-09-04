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

import { useSafeAreaInsets } from 'react-native-safe-area-context'

import Screen, { ScreenProps } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import ScrollSection, { ScrollSectionProps } from '~/components/layout/ScrollSection'

export type ModalProps<ScreenType = ScreenProps | ScrollScreenProps> = ScreenType & {
  onClose?: () => void
}

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
