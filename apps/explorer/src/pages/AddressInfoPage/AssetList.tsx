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

import { AddressHash } from '@alephium/shared'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import { flatMap, sortBy } from 'lodash'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCopperDiamondLine, RiNftLine, RiQuestionLine } from 'react-icons/ri'
import styled, { useTheme } from 'styled-components'

import { queries } from '@/api'
import { useAssetsMetadata } from '@/api/assets/assetsHooks'
import TableTabBar, { TabItem } from '@/components/Table/TableTabBar'
import NFTList from '@/pages/AddressInfoPage/NFTList'
import TokenList from '@/pages/AddressInfoPage/TokenList'
import { alphMetadata } from '@/utils/assets'

interface AssetListProps {
  addressHash: AddressHash
  addressBalance?: AddressBalance
  limit?: number
  className?: string
}

const AssetList = ({ addressHash, addressBalance, limit, className }: AssetListProps) => {
  const { t } = useTranslation()
  const theme = useTheme()

  const { data: assets, isLoading: assetsLoading } = useQuery(queries.assets.balances.addressTokens(addressHash))

  const assetIds = assets?.map((a) => a.tokenId)

  const {
    fungibleTokens: fungibleTokensMetadata,
    nfts: nftsMetadata,
    unknown: unknownAssetsIds,
    isLoading: assetsMetadataLoading
  } = useAssetsMetadata(assetIds)

  const isLoading = assetsLoading || assetsMetadataLoading

  const fungibleTokens = useMemo(() => {
    const unsorted = flatMap(fungibleTokensMetadata, (t) => {
      const balance = assets?.find((a) => a.tokenId === t.id)

      return balance ? [{ ...t, balance: BigInt(balance.balance), lockedBalance: BigInt(balance.lockedBalance) }] : []
    })

    // Add ALPH
    if (addressBalance && BigInt(addressBalance.balance) > 0) {
      unsorted.unshift({
        ...alphMetadata,
        balance: BigInt(addressBalance.balance),
        lockedBalance: BigInt(addressBalance.lockedBalance)
      })
    }

    return sortBy(unsorted, [(t) => !t.verified, (t) => !t.name, (t) => t.name.toLowerCase(), 'id'])
  }, [addressBalance, assets, fungibleTokensMetadata])

  const unknownAssets = useMemo(
    () =>
      unknownAssetsIds.flatMap((id) => {
        const assetBalance = assets?.find((a) => a.tokenId === id)

        if (assetBalance) {
          return { id, ...{ balance: BigInt(assetBalance.balance), lockedBalance: BigInt(assetBalance.lockedBalance) } }
        }

        return []
      }),
    [assets, unknownAssetsIds]
  )

  const tabs: TabItem[] = [
    {
      value: 'tokens',
      icon: <RiCopperDiamondLine />,
      label: t('Tokens'),
      length: fungibleTokens.length,
      loading: isLoading,
      highlightColor: '#0cbaff'
    },
    {
      value: 'nfts',
      label: t('NFTs'),
      icon: <RiNftLine />,
      length: nftsMetadata.length,
      loading: isLoading,
      highlightColor: '#ffae0c'
    }
  ]

  if (!isLoading && unknownAssetsIds.length > 0)
    tabs.push({
      value: 'unknown',
      label: t('Unknown'),
      icon: <RiQuestionLine size={14} />,
      length: unknownAssetsIds.length,
      loading: isLoading,
      highlightColor: theme.font.primary
    })

  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])

  useEffect(() => {
    addressHash && setCurrentTab(tabs[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addressHash])

  return (
    <div className={className}>
      <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
      {fungibleTokens.length > 0 || nftsMetadata.length > 0 ? (
        {
          tokens: fungibleTokens && <TokenList limit={limit} tokens={fungibleTokens} isLoading={isLoading} />,
          nfts: nftsMetadata && <NFTList nfts={nftsMetadata} isLoading={isLoading} />,
          unknown: unknownAssets && <TokenList limit={limit} tokens={unknownAssets} isLoading={isLoading} />
        }[currentTab.value]
      ) : (
        <EmptyListContainer>{t('No assets yet')}</EmptyListContainer>
      )}
    </div>
  )
}

export default styled(AssetList)`
  margin-bottom: 35px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: 9px;
`

const EmptyListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
