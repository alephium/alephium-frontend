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
import { networkStatusChanged } from '../store/networkSlice'
import { useAppDispatch, useAppSelector } from './redux'
import useInterval from './useInterval'

const useInitializeClient = () => {
  const dispatch = useAppDispatch()
  const network = useAppSelector((state) => state.network)

  const initializeClient = useCallback(async () => {
    try {
      await client.init(network.settings)
      dispatch(networkStatusChanged('online'))
      console.log(`Client initialized. Current network: ${network.name}`)
    } catch (e) {
      console.error('Could not connect to network: ', network.name)
      console.error(e)
      dispatch(networkStatusChanged('offline'))
    }
  }, [dispatch, network.name, network.settings])

  useEffect(() => {
    if (network.status === 'connecting') {
      initializeClient()
    }
  }, [initializeClient, network.status])

  useInterval(initializeClient, 2000, network.status !== 'offline')
}

export default useInitializeClient
