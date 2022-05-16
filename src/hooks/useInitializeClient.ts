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

import { useEffect } from 'react'

import client from '../api/client'
import { networkStatusChanged } from '../store/networkSlice'
import { useAppDispatch, useAppSelector } from './redux'

const useInitializeClient = () => {
  const dispatch = useAppDispatch()
  const networkName = useAppSelector((state) => state.network.name)
  const networkStatus = useAppSelector((state) => state.network.status)
  const networkSettings = useAppSelector((state) => state.network.settings)

  useEffect(() => {
    const initializeClient = async () => {
      try {
        await client.init(networkSettings)
        dispatch(networkStatusChanged('online'))
        console.log(`Client initialized. Current network: ${networkName}`)
      } catch (e) {
        console.error('Could not connect to network: ', networkName)
        console.error(e)
        dispatch(networkStatusChanged('offline'))
      }
    }

    let interval: ReturnType<typeof setInterval>

    if (networkStatus === 'offline') {
      interval = setInterval(initializeClient, 2000)
    } else if (networkStatus === 'connecting') {
      initializeClient()
    }

    return () => clearInterval(interval)
  }, [dispatch, networkName, networkSettings, networkStatus])
}

export default useInitializeClient
