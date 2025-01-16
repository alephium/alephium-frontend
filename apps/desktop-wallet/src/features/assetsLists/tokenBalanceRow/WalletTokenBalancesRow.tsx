import { TableCell, TableRow } from '@/components/Table'
import FTAllocationCell from '@/features/assetsLists/tokenBalanceRow/FTAllocationCell'
import { FTWalletAmountCell } from '@/features/assetsLists/tokenBalanceRow/FTAmountCells'
import FTPriceCell from '@/features/assetsLists/tokenBalanceRow/FTPriceCell'
import FTWorthCell from '@/features/assetsLists/tokenBalanceRow/FTWorthCell'
import { FTNameCell, NSTNameCell } from '@/features/assetsLists/tokenBalanceRow/NameCells'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { TokenBalancesRowBaseProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const WalletFTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TableCell fixedWidth={50} noBorder>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <FTNameCell tokenId={tokenId} />
    <FTPriceCell tokenId={tokenId} />
    <FTAllocationCell tokenId={tokenId} />
    <FTWalletAmountCell tokenId={tokenId} />
    <FTWorthCell tokenId={tokenId} />
  </TableRow>
)

export const WalletNSTBalancesRow = ({ tokenId }: TokenBalancesRowBaseProps) => (
  <TableRow key={tokenId} role="row">
    <TableCell fixedWidth={50}>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <NSTNameCell tokenId={tokenId} />
    <FTWalletAmountCell tokenId={tokenId} />
  </TableRow>
)
