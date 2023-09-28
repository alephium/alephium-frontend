/*
Copyright 2018 - 2022 The Alephium Authors
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

import { useEffect, useState } from 'react'

import { useAppSelector } from '~/hooks/redux'
import { getWalletsMetadata } from '~/persistent-storage/wallets'
import { WalletMetadata } from '~/types/wallet'

export const useSortedWallets = () => {
  const activeWalletId = useAppSelector((s) => s.activeWallet.id)

  const [wallets, setWallets] = useState<WalletMetadata[]>([])

  const activeWallet = wallets.find((wallet) => wallet.id === activeWalletId)
  const sortedWallets = wallets
    .filter((wallet) => wallet.id !== activeWalletId)
    .sort((a, b) => a.name.localeCompare(b.name))
  if (activeWallet) sortedWallets.unshift(activeWallet)

  useEffect(() => {
    const getWallets = async () => {
      const wallets = await getWalletsMetadata()
      setWallets(wallets)
    }
    getWallets()
  }, [activeWalletId])

  return sortedWallets
}
