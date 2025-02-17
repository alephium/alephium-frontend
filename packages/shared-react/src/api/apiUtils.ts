interface GetQueryConfigProps {
  gcTime: number
  staleTime?: number
  networkId?: number
}

export const getQueryConfig = ({ staleTime, gcTime, networkId }: GetQueryConfigProps) => ({
  staleTime,
  gcTime,
  meta: { isMainnet: networkId === 0 }
})
