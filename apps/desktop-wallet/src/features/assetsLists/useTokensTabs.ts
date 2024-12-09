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

import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TabItem } from '@/components/TabBar'
import { TokensTabsBaseProps, TokensTabValue } from '@/features/assetsLists/types'

interface TokenTabsProps extends TokensTabsBaseProps {
  ftsTabTitle: string
  nstsTabTitle: string
  nftsTabTitle: string
  numberOfNSTs: number
}

const useTokensTabs = ({ numberOfNSTs, ftsTabTitle, nftsTabTitle, nstsTabTitle }: TokenTabsProps) => {
  const { t } = useTranslation()

  const [isExpanded, setIsExpanded] = useState(false)

  const [tabs, setTabs] = useState<TabItem<TokensTabValue>[]>([
    { value: 'fts', label: ftsTabTitle },
    { value: 'nfts', label: nftsTabTitle }
  ])

  useEffect(() => {
    if (numberOfNSTs > 0 && tabs.length === 2) {
      setTabs([...tabs, { value: 'nsts', label: nstsTabTitle }])
    }
  }, [t, tabs, numberOfNSTs, nstsTabTitle])

  const toggleExpansion = useCallback(() => setIsExpanded(!isExpanded), [isExpanded])

  return {
    tabs,
    isExpanded,
    toggleExpansion
  }
}

export default useTokensTabs
