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

import { isNetworkValid, NetworkNames, networkPresetSwitched } from '@alephium/shared'
import { ChainInfo } from '@alephium/walletconnect-provider'

import { useSharedDispatch, useSharedSelector } from '@/redux'

export const useWalletConnectNetwork = (networkId: ChainInfo['networkId'], onSuccess?: () => Promise<void>) => {
  const currentNetworkId = useSharedSelector((s) => s.network.settings.networkId)
  const dispatch = useSharedDispatch()

  const handleSwitchNetworkPress = async () => {
    if (networkId === 'mainnet' || networkId === 'testnet' || networkId === 'devnet') {
      onSuccess && (await onSuccess())
      dispatch(networkPresetSwitched(NetworkNames[networkId]))
    }
  }

  const showNetworkWarning = networkId && !isNetworkValid(networkId, currentNetworkId)

  return {
    handleSwitchNetworkPress,
    showNetworkWarning
  }
}
