import { explorer as e } from '@alephium/web3'
import { FlashListRef } from '@shopify/flash-list'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import WalletTransactionsFlashList from '~/features/transactionsDisplay/WalletTransactionsFlashList'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'

const ActivityScreen = () => {
  const { t } = useTranslation()
  const listRef = useRef<FlashListRef<e.Transaction>>(null)
  const scrollEndHandler = useAutoScrollOnDragEnd(listRef)
  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('Activity') }} scrollY={screenScrollY} />
      <WalletTransactionsFlashList
        ref={listRef}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        ListHeaderComponent={<ScreenTitle title={t('Activity')} scrollY={screenScrollY} paddingTop />}
      />
    </Screen>
  )
}

export default ActivityScreen
