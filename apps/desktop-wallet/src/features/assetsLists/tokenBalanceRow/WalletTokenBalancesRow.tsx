import { TableCell } from '@/components/Table'
import FTAllocationCell from '@/features/assetsLists/tokenBalanceRow/FTAllocationCell'
import { FTWalletAmountCell } from '@/features/assetsLists/tokenBalanceRow/FTAmountCells'
import FTPriceCell from '@/features/assetsLists/tokenBalanceRow/FTPriceCell'
import { FTWalletWorthCell } from '@/features/assetsLists/tokenBalanceRow/FTWorthCell'
import { FTNameCell, NSTNameCell } from '@/features/assetsLists/tokenBalanceRow/NameCells'
import TokenBalancesRow from '@/features/assetsLists/tokenBalanceRow/TokenBalancesRow'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const WalletFTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TokenBalancesRow tokenId={tokenId}>
    <TableCell fixedWidth={50} noBorder>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <FTNameCell tokenId={tokenId} />
    <FTPriceCell tokenId={tokenId} />
    <FTAllocationCell tokenId={tokenId} />
    <FTWalletAmountCell tokenId={tokenId} />
    <FTWalletWorthCell tokenId={tokenId} />
  </TokenBalancesRow>
)

export const WalletNSTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TokenBalancesRow tokenId={tokenId}>
    <TableCell fixedWidth={50}>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <NSTNameCell tokenId={tokenId} />
    <TableCell>-</TableCell>
    <TableCell fixedWidth={140} />
    <FTWalletAmountCell tokenId={tokenId} />
    <TableCell align="right">-</TableCell>
  </TokenBalancesRow>
)
