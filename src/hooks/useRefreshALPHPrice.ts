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

import { priceUpdated } from '../store/priceSlice'
import { useAppDispatch, useAppSelector } from './redux'

const useRefreshALPHPrice = () => {
  const dispatch = useAppDispatch()
  const priceStatus = useAppSelector((state) => state.price.status)

  useEffect(() => {
    if (priceStatus === 'uninitialized') dispatch(priceUpdated())
  }, [dispatch, priceStatus])

  useEffect(() => {
    setInterval(() => {
      dispatch(priceUpdated())
    }, 60 * 1000)
  }, [dispatch])
}

export default useRefreshALPHPrice
