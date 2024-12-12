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
import { UseQueryResult } from '@tanstack/react-query'
import { createContext, ReactNode, useContext, useMemo } from 'react'

import { ApiContextProps } from '@/api/apiTypes'

type CombineFn<TQueryFnData, TData> = (results: UseQueryResult<TQueryFnData>[]) => ApiContextProps<TData>

interface CreateDataContextParams<TQueryFnData, TData> {
  useDataHook: (combineFn: CombineFn<TQueryFnData, TData>) => ApiContextProps<TData>
  combineFn: CombineFn<TQueryFnData, TData>
  defaultValue: TData
}

export const createDataContext = <TQueryFnData, TData>({
  useDataHook,
  combineFn,
  defaultValue
}: CreateDataContextParams<TQueryFnData, TData>) => {
  const DataContext = createContext<ApiContextProps<TData>>({
    data: defaultValue,
    isLoading: false,
    isFetching: false,
    error: false
  })

  const useData = () => useContext(DataContext)

  const DataContextProvider = ({ children }: { children: ReactNode }) => {
    const { data, isLoading, isFetching, error } = useDataHook(combineFn)

    const value = useMemo(() => ({ data, isLoading, isFetching, error }), [data, isLoading, isFetching, error])

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>
  }

  return { useData, DataContextProvider }
}
