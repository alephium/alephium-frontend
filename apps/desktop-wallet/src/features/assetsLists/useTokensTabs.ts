import { useEffect, useState } from 'react'
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

  const [tabs, setTabs] = useState<TabItem<TokensTabValue>[]>([
    { value: 'fts', label: ftsTabTitle },
    { value: 'nfts', label: nftsTabTitle }
  ])

  useEffect(() => {
    if (numberOfNSTs > 0 && tabs.length === 2) {
      setTabs([...tabs, { value: 'nsts', label: nstsTabTitle }])
    }
  }, [t, tabs, numberOfNSTs, nstsTabTitle])

  return {
    tabs
  }
}

export default useTokensTabs
