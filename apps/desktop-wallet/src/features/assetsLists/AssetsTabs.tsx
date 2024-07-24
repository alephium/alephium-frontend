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

import { useAddressesUnlistedNonStandardTokenIds } from '@/api/addressesUnlistedTokensHooks'
import FocusableContent from '@/components/FocusableContent'
import { TabItem } from '@/components/TabBar'
import { ExpandableTable } from '@/components/Table'
import TableTabBar from '@/components/TableTabBar'
import FungibleTokensBalancesList from '@/features/assetsLists/FungibleTokensBalancesList'
import NFTsGrid from '@/features/assetsLists/NFTsGrid'
import { AssetsTabsProps } from '@/features/assetsLists/types'
import UnknownTokensBalancesList from '@/features/assetsLists/UnknownTokensBalancesList'

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
    { value: 'tokens', label: tokensTabTitle ?? '💰 ' + t('Tokens') },
    { value: 'nfts', label: nftsTabTitle ?? '🖼️ ' + t('NFTs') }
  ])
  const [currentTab, setCurrentTab] = useState<TabItem>(tabs[0])
  const [isExpanded, setIsExpanded] = useState(false)

  const handleButtonClick = () => setIsExpanded(!isExpanded)

  useEffect(() => {
    if (addressesNonStandardTokenIds.length > 0 && tabs.length === 2) {
      setTabs([...tabs, { value: 'unknownTokens', label: unknownTokensTabTitle ?? '❔' + t('Unknown tokens') }])
    }
  }, [t, tabs, addressesNonStandardTokenIds.length, unknownTokensTabTitle])

  return (
    <FocusableContent className={className} isFocused={isExpanded} onClose={() => setIsExpanded(false)}>
      <ExpandableTable isExpanded={isExpanded} maxHeightInPx={maxHeightInPx}>
        <TableTabBar items={tabs} onTabChange={(tab) => setCurrentTab(tab)} activeTab={currentTab} />
        {
          {
            tokens: (
              <FungibleTokensBalancesList
                addressHash={addressHash}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            ),
            nfts: (
              <NFTsGrid
                addressHash={addressHash}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
                nftColumns={nftColumns}
              />
            ),
            unknownTokens: (
              <UnknownTokensBalancesList
                addressHash={addressHash}
                isExpanded={isExpanded || !maxHeightInPx}
                onExpand={handleButtonClick}
              />
            )
          }[currentTab.value]
        }
      </ExpandableTable>
    </FocusableContent>
  )
}

export default AssetsTabs
