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
import { throttle } from 'lodash'
import { useEffect } from 'react'

import { useAppSelector } from '@/hooks/redux'
import useWalletLock from '@/hooks/useWalletLock'

// Inspired by useIdle: https://github.com/uidotdev/usehooks/blob/main/index.js

const useAutoLock = () => {
  const walletLockTimeInMinutes = useAppSelector((s) => s.settings.walletLockTimeInMinutes)
  const lockAfterMs = (walletLockTimeInMinutes || 0) * ONE_MINUTE_MS

  const { lockWallet, isWalletUnlocked } = useWalletLock()

  useEffect(() => {
    if (!isWalletUnlocked || lockAfterMs === 0) return

    let timeoutId: number | undefined

    const handleTimeout = () => {
      lockWallet('Auto lock')
    }

    const handleEvent = throttle(() => {
      window.clearTimeout(timeoutId)
      timeoutId = window.setTimeout(handleTimeout, lockAfterMs)
    }, 500)

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleEvent()
      }
    }

    timeoutId = window.setTimeout(handleTimeout, lockAfterMs)

    window.addEventListener('mousemove', handleEvent)
    window.addEventListener('mousedown', handleEvent)
    window.addEventListener('resize', handleEvent)
    window.addEventListener('keydown', handleEvent)
    window.addEventListener('touchstart', handleEvent)
    window.addEventListener('wheel', handleEvent)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('mousemove', handleEvent)
      window.removeEventListener('mousedown', handleEvent)
      window.removeEventListener('resize', handleEvent)
      window.removeEventListener('keydown', handleEvent)
      window.removeEventListener('touchstart', handleEvent)
      window.removeEventListener('wheel', handleEvent)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearTimeout(timeoutId)
    }
  }, [isWalletUnlocked, lockAfterMs, lockWallet])
}

export default useAutoLock
