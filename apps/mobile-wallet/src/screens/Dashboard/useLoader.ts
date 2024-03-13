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

import { useEffect, useRef, useState } from 'react'

import { useAppSelector } from '~/hooks/redux'

export const useLoader = () => {
  const isLoadingLatestTxs = useAppSelector((s) => s.addresses.loadingLatestTransactions)
  const isLoadingBalances = useAppSelector((s) => s.addresses.loadingBalances)
  const isLoadingTokens = useAppSelector((s) => s.addresses.loadingTokens)
  const isLoadingAlphHistoricBalances = useAppSelector((s) => s.addresses.loadingAlphHistoricBalances)

  const txsLoadingCompleted = useRef<boolean>()
  const balancesLoadingCompleted = useRef<boolean>()
  const tokensLoadingCompleted = useRef<boolean>()
  const historyLoadingCompleted = useRef<boolean>()

  const [progress, setProgress] = useState(0)
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    if (progress === 1) setTimeout(() => setShowLoader(false), 1000)
  }, [progress])

  const updateProgress = () => setProgress((previousValue) => previousValue + 0.25)

  useEffect(() => {
    if (isLoadingLatestTxs) {
      txsLoadingCompleted.current = false
    } else if (txsLoadingCompleted.current === false) {
      updateProgress()
    }
  }, [isLoadingLatestTxs])

  useEffect(() => {
    if (isLoadingBalances) {
      balancesLoadingCompleted.current = false
    } else if (balancesLoadingCompleted.current === false) {
      updateProgress()
    }
  }, [isLoadingBalances])

  useEffect(() => {
    if (isLoadingTokens) {
      tokensLoadingCompleted.current = false
    } else if (tokensLoadingCompleted.current === false) {
      updateProgress()
    }
  }, [isLoadingTokens])

  useEffect(() => {
    if (isLoadingAlphHistoricBalances) {
      historyLoadingCompleted.current = false
    } else if (historyLoadingCompleted.current === false) {
      updateProgress()
    }
  }, [isLoadingAlphHistoricBalances])

  return { showLoader, progress }
}
