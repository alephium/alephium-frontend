import { AddressHash } from '@alephium/shared'

export type TokensTabValue = 'fts' | 'nfts' | 'nsts'
export type TokensAndActivityTabValue = 'fts' | 'nfts' | 'nsts' | 'activity'

export interface TokensTabsBaseProps {
  className?: string
  isExpanded?: boolean
  onExpand?: () => void
}

export interface WalletTokensTabsProps extends TokensTabsBaseProps {
  maxHeightInPx?: number
}

export interface AddressDetailsTabsProps extends TokensTabsBaseProps {
  addressHash: AddressHash
}
