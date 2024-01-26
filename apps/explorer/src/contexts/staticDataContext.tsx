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
