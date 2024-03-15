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

import SpinnerModal from '~/components/SpinnerModal'
import { useAppSelector } from '~/hooks/redux'

const InitialDataLoader = () => {
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const isLoadingLatestTxs = useAppSelector((s) => s.loaders.loadingLatestTransactions)
  const isLoadingBalances = useAppSelector((s) => s.loaders.loadingBalances)
  const isLoadingTokens = useAppSelector((s) => s.loaders.loadingTokens)
  const isLoadingAlphHistoricBalances = useAppSelector((s) => s.loaders.loadingAlphHistoricBalances)

  const txsLoadingCompleted = useRef<boolean>()
  const balancesLoadingCompleted = useRef<boolean>()
  const tokensLoadingCompleted = useRef<boolean>()
  const historyLoadingCompleted = useRef<boolean>()

  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (addressesStatus === 'initialized') setProgress(1)
  }, [addressesStatus])

  const updateProgress = (num: number) => setProgress((previousValue) => previousValue + num)

  // Fake initial progress to show some movement for better UX ;)
  const stopFakeProgress = progress >= 0.9
  const decelaratedProgressUpdate = () => setProgress((p) => p + 0.025 * (1 - p))
  useInterval(decelaratedProgressUpdate, 300, stopFakeProgress)

  useEffect(() => {
    if (isLoadingLatestTxs) {
      txsLoadingCompleted.current = false
    } else if (txsLoadingCompleted.current === false) {
      updateProgress(0.25)
      txsLoadingCompleted.current = true
    }
  }, [isLoadingLatestTxs])

  useEffect(() => {
    if (isLoadingBalances) {
      balancesLoadingCompleted.current = false
    } else if (balancesLoadingCompleted.current === false) {
      updateProgress(0.25)
      balancesLoadingCompleted.current = true
    }
  }, [isLoadingBalances])

  useEffect(() => {
    if (isLoadingTokens) {
      tokensLoadingCompleted.current = false
    } else if (tokensLoadingCompleted.current === false) {
      updateProgress(0.25)
      tokensLoadingCompleted.current = true
    }
  }, [isLoadingTokens])

  useEffect(() => {
    if (isLoadingAlphHistoricBalances) {
      historyLoadingCompleted.current = false
    } else if (historyLoadingCompleted.current === false) {
      updateProgress(0.25)
      historyLoadingCompleted.current = true
    }
  }, [isLoadingAlphHistoricBalances])

  return <SpinnerModal isActive={true} blur={false} bg="full" progress={progress} animated={false} />
}

export default InitialDataLoader
