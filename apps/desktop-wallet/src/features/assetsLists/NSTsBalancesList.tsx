import useFetchAddressTokensByType from '@/api/apiDataHooks/address/useFetchAddressTokensByType'
import useFetchWalletTokensByType from '@/api/apiDataHooks/wallet/useFetchWalletTokensByType'
import ExpandableTokensBalancesList from '@/features/assetsLists/ExpandableTokensBalancesList'
import { AddressNSTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/AddressTokenBalancesRow'
import { WalletNSTBalancesRow } from '@/features/assetsLists/tokenBalanceRow/WalletTokenBalancesRow'
import { AddressTokensTabsProps, TokensTabsBaseProps } from '@/features/assetsLists/types'

export const AddressNSTsBalancesList = ({ addressHash, ...props }: AddressTokensTabsProps) => {
  const {
    data: { nstIds }
  } = useFetchAddressTokensByType({ addressHash, includeAlph: false })

  return (
    <ExpandableTokensBalancesList {...props}>
      {nstIds.map((tokenId) => (
        <AddressNSTBalancesRow tokenId={tokenId} addressHash={addressHash} key={tokenId} />
      ))}
    </ExpandableTokensBalancesList>
  )
}

export const WalletNSTsBalancesList = (props: TokensTabsBaseProps) => {
  const {
    data: { nstIds }
  } = useFetchWalletTokensByType({ includeAlph: false })

  return (
    <ExpandableTokensBalancesList {...props} nbOfItems={3}>
      {nstIds.map((tokenId) => (
        <WalletNSTBalancesRow tokenId={tokenId} key={tokenId} />
      ))}
    </ExpandableTokensBalancesList>
  )
}
