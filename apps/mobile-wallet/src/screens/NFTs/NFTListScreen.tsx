import { NFT } from '@alephium/shared'
import { useFetchWalletNfts, useIsExplorerOffline } from '@alephium/shared-react'
import { FlashList } from '@shopify/flash-list'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import NftsGridFlashList from '~/features/assetsDisplay/nftsDisplay/NftsGridFlashList'
import OfflineMessage from '~/features/offline/OfflineMessage'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'

const NFTListScreen = () => {
  const { t } = useTranslation()
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()
  const listRef = useRef<FlashList<NFT[] | NFT['collectionId']>>(null)
  const scrollEndHandler = useAutoScrollOnDragEnd(listRef)
  const isExplorerOffline = useIsExplorerOffline()

  const { data: nfts, isLoading } = useFetchWalletNfts()

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('NFTs') }} scrollY={screenScrollY} />
      <NftsGridFlashList
        ref={listRef}
        nfts={nfts}
        isLoading={isLoading}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        ListHeaderComponent={
          <>
            <ScreenTitle title={t('NFTs')} scrollY={screenScrollY} paddingTop />
            {isExplorerOffline && <OfflineMessage />}
          </>
        }
      />
    </Screen>
  )
}

export default NFTListScreen
