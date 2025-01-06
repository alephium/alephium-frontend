import { StackScreenProps } from '@react-navigation/stack'
import { FlashList } from '@shopify/flash-list'
import { useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

import BaseHeader from '~/components/headers/BaseHeader'
import Screen from '~/components/layout/Screen'
import ScreenTitle from '~/components/layout/ScreenTitle'
import TransactionsFlashList from '~/components/layout/TransactionsFlashList'
import useAutoScrollOnDragEnd from '~/hooks/layout/useAutoScrollOnDragEnd'
import useScreenScrollHandler from '~/hooks/layout/useScreenScrollHandler'
import { useAppSelector } from '~/hooks/redux'
import { InWalletTabsParamList } from '~/navigation/InWalletNavigation'
import RootStackParamList from '~/navigation/rootStackRoutes'
import { makeSelectAddressesConfirmedTransactions } from '~/store/confirmedTransactionsSlice'
import { makeSelectAddressesPendingTransactions } from '~/store/pendingTransactionsSlice'
import { AddressTransaction } from '~/types/transactions'

type ScreenProps = StackScreenProps<InWalletTabsParamList & RootStackParamList, 'ActivityScreen'>

const ActivityScreen = ({ navigation }: ScreenProps) => {
  const listRef = useRef<FlashList<AddressTransaction>>(null)
  const { t } = useTranslation()

  const selectAddressesConfirmedTransactions = useMemo(makeSelectAddressesConfirmedTransactions, [])
  const selectAddressesPendingTransactions = useMemo(makeSelectAddressesPendingTransactions, [])
  const confirmedTransactions = useAppSelector(selectAddressesConfirmedTransactions)
  const pendingTransactions = useAppSelector(selectAddressesPendingTransactions)

  const scrollEndHandler = useAutoScrollOnDragEnd(listRef)

  const { screenScrollY, screenScrollHandler } = useScreenScrollHandler()

  return (
    <Screen>
      <BaseHeader options={{ headerTitle: t('Activity') }} scrollY={screenScrollY} />
      <TransactionsFlashList
        ref={listRef}
        confirmedTransactions={confirmedTransactions}
        pendingTransactions={pendingTransactions}
        onScroll={screenScrollHandler}
        onScrollEndDrag={scrollEndHandler}
        ListHeaderComponent={<ScreenTitle title={t('Activity')} scrollY={screenScrollY} paddingTop />}
      />
    </Screen>
  )
}

export default ActivityScreen
