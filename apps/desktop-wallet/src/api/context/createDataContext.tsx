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
