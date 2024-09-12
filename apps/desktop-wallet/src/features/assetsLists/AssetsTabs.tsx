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

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import FocusableContent from '@/components/FocusableContent'
import { TabItem } from '@/components/TabBar'
import { ExpandableTable } from '@/components/Table'
import TableTabBar, { TabAnimation } from '@/components/TableTabBar'
import FungibleTokensBalancesList from '@/features/assetsLists/FungibleTokensBalancesList'
import NFTsGrid from '@/features/assetsLists/NFTsGrid'
import NonStandardTokensBalancesList from '@/features/assetsLists/NonStandardTokensBalancesList'
import { AssetsTabsProps } from '@/features/assetsLists/types'

const AssetsTabs = ({
  className,
  addressHash,
  tokensTabTitle,
  unknownTokensTabTitle,
  nftsTabTitle,
  maxHeightInPx,
  nftColumns
}: AssetsTabsProps) => {
  const { t } = useTranslation()
  const { data: addressesNonStandardTokenIds } = useAddressesUnlistedNonStandardTokenIds(addressHash)

  const [tabs, setTabs] = useState([
    { value: 'fts', label: tokensTabTitle ?? '💰 ' + t('Tokens') },
    { value: 'nfts', label: nftsTabTitle ?? '🖼️ ' + t('NFTs') }
  ])
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])
  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  useEffect(() => {
    if (addressesNonStandardTokenIds.length > 0 && tabs.length === 2) {
      setTabs([...tabs, { value: 'nsts', label: unknownTokensTabTitle ?? '❔' + t('Unknown tokens') }])
    }
  }, [t, tabs, addressesNonStandardTokenIds.length, unknownTokensTabTitle])

  return (
    <FocusableContent className={className} isFocused={isExpanded} onClose={() => setIsExpanded(false)}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />

        <TabAnimation isVisible={currentTab.value === 'fts'}>
          <TokensTabContent isExpanded={isExpanded}>
            <FungibleTokensBalancesList
              addressHash={addressHash}
              isExpanded={isExpanded || !maxHeightInPx}
              onExpand={handleButtonClick}
              maxHeightInPx={maxHeightInPx}
            />
          </TokensTabContent>
        </TabAnimation>
        <TabAnimation isVisible={currentTab.value === 'nfts'}>
          <TokensTabContent isExpanded={isExpanded}>
            <NFTsGrid
              addressHash={addressHash}
              isExpanded={isExpanded || !maxHeightInPx}
              onExpand={handleButtonClick}
              nftColumns={nftColumns}
            />
          </TokensTabContent>
        </TabAnimation>
        <TabAnimation isVisible={currentTab.value === 'nsts'}>
          <TokensTabContent isExpanded={isExpanded}>
            <NonStandardTokensBalancesList
              addressHash={addressHash}
              isExpanded={isExpanded || !maxHeightInPx}
              onExpand={handleButtonClick}
            />
          </TokensTabContent>
        </TabAnimation>
      </ExpandableTable>
    </FocusableContent>
  )
}

export default AssetsTabs

const TokensTabContent = styled.div<{ isExpanded: boolean }>`
  position: ${({ isExpanded }) => (isExpanded ? 'relative' : 'absolute')};
  width: 100%;
`
