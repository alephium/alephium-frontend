import { TabItem } from '@/components/TabBar'
import { TokensTabsBaseProps, TokensTabValue } from '@/features/assetsLists/types'

interface TokenTabsProps extends TokensTabsBaseProps {
  ftsTabTitle: string
  nftsTabTitle: string
}

const useTokensTabs = ({ ftsTabTitle, nftsTabTitle }: TokenTabsProps): TabItem<TokensTabValue>[] => [
  { value: 'fts', label: ftsTabTitle },
  { value: 'nfts', label: nftsTabTitle }
]

export default useTokensTabs
