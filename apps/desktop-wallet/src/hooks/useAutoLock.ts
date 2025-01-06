import { ONE_MINUTE_MS } from '@alephium/shared'
import { useIdleTimer } from 'react-idle-timer'

import { useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'

const useAutoLock = () => {
  const walletLockTimeInMinutes = useAppSelector((s) => s.settings.walletLockTimeInMinutes)
  const lockAfterMs = (walletLockTimeInMinutes || 0) * ONE_MINUTE_MS

  const { lockWallet, isWalletUnlocked } = useWalletLock()

  useIdleTimer({
    onIdle: () => lockWallet('Auto lock'),
    timeout: lockAfterMs > 0 ? lockAfterMs : undefined,
    throttle: 500,
    disabled: !isWalletUnlocked || lockAfterMs === 0
  })
}

export default useAutoLock
