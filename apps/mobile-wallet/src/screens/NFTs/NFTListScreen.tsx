import { NFT } from '@alephium/shared'
import { StackScreenProps } from '@react-navigation/stack'
import { FlashList } from '@shopify/flash-list'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen, { ScreenProps } from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import NFTsGrid from '~/components/NFTsGrid'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'

type NFTListScreenProps = StackScreenProps<InWalletTabsParamList, 'NFTListScreen'> & ScreenProps

const NFTListScreen = ({ navigation }: NFTListScreenProps) => {
  const { t } = useTranslation()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const listRef = useRef<FlashList<NFT>>(null)
  const scrollEndHandler = useAutoScrollOnDragEnd(listRef)

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('NFTs') }} scrollY={screenScrollY} />
      <NFTsGrid
        ref={listRef}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        ListHeaderComponent={<ScreenTitle title={t('NFTs')} scrollY={screenScrollY} paddingTop />}
      />
    </Screen>
  )
}

export default NFTListScreen
