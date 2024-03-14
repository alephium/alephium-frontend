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

import { useInterval } from '@alephium/shared-react'
import { useEffect, useRef, useState } from 'react'

import { useAppSelector } from '~/hooks/redux'

export const useLoader = () => {
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isLoadingLatestTxs = useAppSelector((s) => s.addresses.loadingLatestTransactions)
  const isLoadingBalances = useAppSelector((s) => s.addresses.loadingBalances)
  const isLoadingTokens = useAppSelector((s) => s.addresses.loadingTokens)
  const isLoadingAlphHistoricBalances = useAppSelector((s) => s.addresses.loadingAlphHistoricBalances)

  const txsLoadingCompleted = useRef<boolean>()
  const balancesLoadingCompleted = useRef<boolean>()
  const tokensLoadingCompleted = useRef<boolean>()
  const historyLoadingCompleted = useRef<boolean>()

  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(addressesStatus === 'uninitialized')

  useEffect(() => {
    if (addressesStatus === 'initialized') setProgress(1)
  }, [addressesStatus])

  useEffect(() => {
    if (progress >= 1) {
      const timeoutId = setTimeout(() => setShowLoader(false), 300)

      return () => clearTimeout(timeoutId)
    }
  }, [addressesStatus, progress])

  const updateProgress = (num: number) => setProgress((previousValue) => previousValue + num)

  // Fake initial progress to show some movement for better UX ;)
  const stopFakeProgress = progress >= 0.5
  useInterval(() => updateProgress(0.025), 300, stopFakeProgress)

  useEffect(() => {
    if (isLoadingLatestTxs) {
      txsLoadingCompleted.current = false
    } else if (txsLoadingCompleted.current === false) {
      updateProgress(0.25)
    }
  }, [isLoadingLatestTxs])

  useEffect(() => {
    if (isLoadingBalances) {
      balancesLoadingCompleted.current = false
    } else if (balancesLoadingCompleted.current === false) {
      updateProgress(0.25)
    }
  }, [isLoadingBalances])

  useEffect(() => {
    if (isLoadingTokens) {
      tokensLoadingCompleted.current = false
    } else if (tokensLoadingCompleted.current === false) {
      updateProgress(0.25)
    }
  }, [isLoadingTokens])

  useEffect(() => {
    if (isLoadingAlphHistoricBalances) {
      historyLoadingCompleted.current = false
    } else if (historyLoadingCompleted.current === false) {
      updateProgress(0.25)
    }
  }, [isLoadingAlphHistoricBalances])

  return { showLoader, progress }
}
