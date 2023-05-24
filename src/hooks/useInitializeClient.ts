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

import { useCallback, useEffect } from 'react'

import client from '../api/client'
import { selectAllAddresses, syncAddressesData } from '../store/addressesSlice'
import { syncNetworkTokensInfo } from '../store/assets/assetsActions'
import { apiClientInitFailed, apiClientInitSucceeded } from '../store/networkSlice'
import { useAppDispatch, useAppSelector } from './redux'
import useInterval from './useInterval'

const useInitializeClient = () => {
  const dispatch = useAppDispatch()
  const network = useAppSelector((s) => s.network)
  const addressesStatus = useAppSelector((s) => s.addresses.status)
  const addresses = useAppSelector(selectAllAddresses)
  const assetsInfo = useAppSelector((s) => s.assetsInfo)

  const initializeClient = useCallback(async () => {
    try {
      client.init(network.settings.nodeHost, network.settings.explorerApiHost)
      const { networkId } = await client.node.infos.getInfosChainParams()
      // TODO: Check if connection to explorer also works
      dispatch(apiClientInitSucceeded({ networkId, networkName: network.name }))
      console.log(`Client initialized. Current network: ${network.name}`)
    } catch (e) {
      dispatch(apiClientInitFailed())
      console.error('Could not connect to network: ', network.name)
      console.error(e)
    }
  }, [network.settings.nodeHost, network.settings.explorerApiHost, network.name, dispatch])

  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

  const shouldInitialize = network.status === 'offline'
  useInterval(initializeClient, 2000, !shouldInitialize)

  useEffect(() => {
    if (network.status === 'online' && addressesStatus === 'uninitialized' && addresses.length > 0) {
      dispatch(syncAddressesData())
    }
  }, [addresses.length, addressesStatus, dispatch, network.status])

  useEffect(() => {
    if (network.status === 'online' && assetsInfo.status === 'uninitialized') {
      dispatch(syncNetworkTokensInfo())
    }
  }, [dispatch, network.status, assetsInfo.status])
}

export default useInitializeClient
