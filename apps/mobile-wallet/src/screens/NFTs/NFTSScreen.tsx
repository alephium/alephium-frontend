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

import { StackScreenProps } from '@react-navigation/stack'
import { useTranslation } from 'react-i18next'

import BottomBarScrollScreen, { BottomBarScrollScreenProps } from '~/components/layout/BottomBarScrollScreen'
import NFTsGrid from '~/components/NFTsGrid'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import { ReceiveNavigationParamList } from '~/navigation/ReceiveNavigation'
import { SendNavigationParamList } from '~/navigation/SendNavigation'
import { DEFAULT_MARGIN } from '~/style/globalStyle'

interface ScreenProps
  extends StackScreenProps<InWalletTabsParamList & ReceiveNavigationParamList & SendNavigationParamList, 'NFTsScreen'>,
    BottomBarScrollScreenProps {}

const NFTsScreen = ({ navigation, ...props }: ScreenProps) => {
  const { t } = useTranslation()

  return (
    <BottomBarScrollScreen
      hasBottomBar
      verticalGap
      contrastedBg
      screenTitleAlwaysVisible
      contentContainerStyle={{ padding: DEFAULT_MARGIN }}
      headerOptions={{
        headerTitle: t('NFTs')
      }}
      {...props}
    >
      <NFTsGrid />
    </BottomBarScrollScreen>
  )
}

export default NFTsScreen
