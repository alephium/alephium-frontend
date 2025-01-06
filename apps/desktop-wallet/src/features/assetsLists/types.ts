import { AddressHash } from '@alephium/shared'

export type TokensTabValue = 'fts' | 'nfts' | 'nsts'

export interface TokensTabsBaseProps {
  className?: string
  isExpanded?: boolean
  onExpand?: () => void
}

export interface WalletTokensTabsProps extends TokensTabsBaseProps {
  maxHeightInPx: number
}

export interface AddressTokensTabsProps extends TokensTabsBaseProps {
  addressHash: AddressHash
}
