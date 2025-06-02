import { AddressHash, calculateTokenAmountWorth, sortAssets } from '@alephium/shared'
import { ALPH } from '@alephium/token-list'
import { AddressBalance } from '@alephium/web3/dist/src/api/api-explorer'
import { useQuery } from '@tanstack/react-query'
import { flatMap } from 'lodash'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RiCopperDiamondLine, RiNftLine, RiQuestionLine } from 'react-icons/ri'
import styled, { useTheme } from 'styled-components'

import { queries } from '@/api'
import { useAssetsMetadata, useTokensPrices } from '@/api/assets/assetsHooks'
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

  const { data: assets, isLoading: assetsLoading } = useQuery(queries.address.assets.tokensBalance(addressHash))

  const assetIds = assets?.map((a) => a.tokenId)

  const {
    fungibleTokens: fungibleTokensMetadata,
    nfts: nftsMetadata,
    unknown: unknownAssetsIds
  } = useAssetsMetadata(assetIds)

  const tokensPrices = useTokensPrices([ALPH.symbol, ...fungibleTokensMetadata.flatMap((t) => t.symbol || [])])

  const isLoading = assetsLoading

  const fungibleTokens = useMemo(() => {
    const unsorted = flatMap(fungibleTokensMetadata, (t) => {
      const balance = assets?.find((a) => a.tokenId === t.id)

      return balance
        ? [
            {
              ...t,
              balance: BigInt(balance.balance),
              lockedBalance: BigInt(balance.lockedBalance),
              worth:
                (t.verified &&
                  calculateTokenAmountWorth(BigInt(balance.balance), tokensPrices[t.symbol], t.decimals)) ||
                undefined
            }
          ]
        : []
    })

    // Add ALPH
    if (addressBalance && BigInt(addressBalance.balance) > 0) {
      unsorted.unshift({
        ...alphMetadata,
        balance: BigInt(addressBalance.balance),
        lockedBalance: BigInt(addressBalance.lockedBalance),
        worth:
          calculateTokenAmountWorth(BigInt(addressBalance.balance), tokensPrices[ALPH.symbol], ALPH.decimals) ||
          undefined
      })
    }

    return sortAssets(unsorted)
  }, [addressBalance, assets, fungibleTokensMetadata, tokensPrices])

  const unknownAssets = useMemo(
    () =>
      unknownAssetsIds.flatMap((id) => {
        const assetBalance = assets?.find((a) => a.tokenId === id)

        if (assetBalance) {
          return {
            id,
            verified: false,
            ...{ balance: BigInt(assetBalance.balance), lockedBalance: BigInt(assetBalance.lockedBalance) }
          }
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
  border-radius: 8px;
  overflow: hidden;
`

const EmptyListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.font.secondary};
  padding: 15px 20px;
  background-color: ${({ theme }) => theme.bg.secondary};
`
