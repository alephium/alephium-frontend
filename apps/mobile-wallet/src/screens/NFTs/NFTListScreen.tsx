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

import BaseHeader from '~/components/headers/BaseHeader'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import NFTsGrid from '~/components/NFTsGrid'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'

type NFTListScreenProps = StackScreenProps<InWalletTabsParamList, 'NFTListScreen'> & ScreenProps

const NFTListScreen = ({ navigation }: NFTListScreenProps) => {
  const { t } = useTranslation()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('NFTs') }} scrollY={screenScrollY} />
      <NFTsGrid
        onScroll={screenScrollHandler}
        ListHeaderComponent={<ScreenTitle title={t('NFTs')} scrollY={screenScrollY} sideDefaultMargin />}
      />
    </Screen>
  )
}

export default NFTListScreen
