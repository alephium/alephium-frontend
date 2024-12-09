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
