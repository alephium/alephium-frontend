import { Asset } from '@alephium/shared'
import { useQuery } from '@tanstack/react-query'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'

import { queries } from '@/api'
import client from '@/api/client'
import { VerifiedFungibleTokenMetadata } from '@/types/assets'

type VerifiedTokenMap = Map<Asset['id'], VerifiedFungibleTokenMetadata>

export interface StaticDataValue {
  verifiedTokens?: VerifiedTokenMap
}

export const StaticDataContext = createContext<StaticDataValue>({
  verifiedTokens: new Map()
})

export const StaticDataProvider = ({ children }: { children: ReactNode }) => {
  const [verifiedTokensMap, setVerifiedTokensMap] = useState<VerifiedTokenMap>()

  const { data: verifiedTokensMetadataData } = useQuery(queries.assets.metadata.allVerifiedTokens(client.networkType))

  useEffect(() => {
    if (!verifiedTokensMap && verifiedTokensMetadataData) {
      setVerifiedTokensMap(new Map(verifiedTokensMetadataData.map((m) => [m.id, m])))
    }
  }, [verifiedTokensMap, verifiedTokensMetadataData])

  return (
    <StaticDataContext.Provider
      value={{
        verifiedTokens: verifiedTokensMap
      }}
    >
      {children}
    </StaticDataContext.Provider>
  )
}

export const useVerifiedTokensMetadata = () => useContext(StaticDataContext).verifiedTokens
