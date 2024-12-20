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

import { useQuery } from '@tanstack/react-query'

import { UseFetchTransactionProps } from '@/api/apiDataHooks/transaction/transactionTypes'
import useFetchPendingTransaction from '@/api/apiDataHooks/transaction/useFetchPendingTransaction'
import { confirmedTransactionQuery } from '@/api/queries/transactionQueries'
import { selectSentTransactionByHash } from '@/features/send/sentTransactions/sentTransactionsSelectors'
import { useAppSelector } from '@/hooks/redux'
import { selectCurrentlyOnlineNetworkId } from '@/storage/network/networkSelectors'

const useFetchTransaction = ({ txHash, skip }: UseFetchTransactionProps) => {
  const sentTx = useAppSelector((s) => selectSentTransactionByHash(s, txHash))
  const networkId = useAppSelector(selectCurrentlyOnlineNetworkId)

  const isPendingTx = sentTx && sentTx.status !== 'confirmed'

  const { data: confirmedTx, isLoading: isLoadingConfirmedTx } = useQuery(
    confirmedTransactionQuery({ txHash, networkId, skip: skip || isPendingTx })
  )
  const { data: pendingTx } = useFetchPendingTransaction({ txHash, skip: skip || !isPendingTx })

  return {
    data: confirmedTx ?? pendingTx,
    isLoading: isLoadingConfirmedTx
  }
}

export default useFetchTransaction
