import { AnalyticsEvent, GettingStartedItem } from '@alephium/shared'
import { useFetchWalletBalances } from '@alephium/shared-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { sendAnalytics } from '~/analytics'
import { useIsWalletWatchOnly } from '~/features/watchOnlyWallet/useIsWalletWatchOnly'
import { useAppSelector } from '~/hooks/redux'
import { getIsGettingStartedActive, storeIsGettingStartedActive } from '~/persistent-storage/wallet'

export interface GettingStartedChecklistItem {
  key: GettingStartedItem
  done: boolean
}

export interface GettingStartedChecklist {
  isVisible: boolean
  items: GettingStartedChecklistItem[]
  completedCount: number
  canDismiss: boolean
  deactivate: () => void
}

const useGettingStartedChecklist = (): GettingStartedChecklist => {
  const walletId = useAppSelector((s) => s.wallet.id)
  const isMnemonicBackedUp = useAppSelector((s) => s.wallet.isMnemonicBackedUp)
  const usesBiometrics = useAppSelector((s) => s.settings.usesBiometrics)
  const isWatchOnly = useIsWalletWatchOnly()
  const { data: tokenBalances } = useFetchWalletBalances()

  const [isActive, setIsActive] = useState(() => (walletId ? getIsGettingStartedActive(walletId) : false))
  const wasVisible = useRef(false)

  useEffect(() => {
    setIsActive(walletId ? getIsGettingStartedActive(walletId) : false)
    wasVisible.current = false
  }, [walletId])

  const items: GettingStartedChecklistItem[] = [
    { key: 'backup', done: !!isMnemonicBackedUp },
    { key: 'receive_funds', done: tokenBalances.length > 0 },
    { key: 'biometrics', done: !!usesBiometrics }
  ]

  const completedCount = items.filter((item) => item.done).length
  const allComplete = completedCount === items.length

  const deactivate = useCallback(() => {
    if (!walletId) return

    setIsActive(false)
    storeIsGettingStartedActive(walletId, false)
  }, [walletId])

  const isVisible = isActive && !isWatchOnly && !allComplete

  useEffect(() => {
    if (isVisible) wasVisible.current = true
  }, [isVisible])

  useEffect(() => {
    if (!isActive || !allComplete) return

    // Deactivate whether or not it was ever seen, so the flag cannot resurrect the block later; only
    // report completion for a checklist a user actually worked through.
    if (wasVisible.current) sendAnalytics({ event: AnalyticsEvent.GETTING_STARTED_COMPLETED })
    deactivate()
  }, [isActive, allComplete, deactivate])

  return {
    isVisible,
    items,
    completedCount,
    canDismiss: !!isMnemonicBackedUp,
    deactivate
  }
}

export default useGettingStartedChecklist
