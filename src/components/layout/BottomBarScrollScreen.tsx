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

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { ScrollViewProps } from 'react-native'

import ScrollScreen, { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

export interface BottomBarScrollScreenProps extends ScrollScreenProps {
  hasHeader?: boolean
  hasBottomBar?: boolean
}

const BottomBarScrollScreen = ({
  hasHeader = false,
  hasBottomBar = false,
  children,
  ...props
}: BottomBarScrollScreenProps) => {
  const bottomBarHeight = useBottomTabBarHeight()

  return (
    <ScrollScreen
      contentContainerStyle={{
        paddingBottom: hasBottomBar ? bottomBarHeight + DEFAULT_MARGIN : 0
      }}
      hasHeader={hasHeader}
      showsHorizontalScrollIndicator={false}
      {...props}
    >
      {children}
    </ScrollScreen>
  )
}

export default BottomBarScrollScreen
