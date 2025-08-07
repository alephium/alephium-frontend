import { TableCell } from '@/components/Table'
import { FTAddressAmountCell } from '@/features/assetsLists/tokenBalanceRow/FTAmountCells'
import FTPriceCell from '@/features/assetsLists/tokenBalanceRow/FTPriceCell'
import { FTAddressWorthCell } from '@/features/assetsLists/tokenBalanceRow/FTWorthCell'
import { FTNameCell, NSTNameCell } from '@/features/assetsLists/tokenBalanceRow/NameCells'
import TokenBalancesRow from '@/features/assetsLists/tokenBalanceRow/TokenBalancesRow'
import TokenLogo from '@/features/assetsLists/tokenBalanceRow/TokenLogo'
import { AddressTokenBalancesRowProps } from '@/features/assetsLists/tokenBalanceRow/types'

export const AddressFTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TokenBalancesRow tokenId={tokenId}>
    <TokenLogo tokenId={tokenId} />
    <FTNameCell tokenId={tokenId} />
    <FTPriceCell tokenId={tokenId} />
    <FTAddressAmountCell tokenId={tokenId} addressHash={addressHash} />
    <FTAddressWorthCell tokenId={tokenId} addressHash={addressHash} />
  </TokenBalancesRow>
)

export const AddressNSTBalancesRow = ({ tokenId, addressHash }: AddressTokenBalancesRowProps) => (
  <TokenBalancesRow tokenId={tokenId}>
    <TableCell fixedWidth={50}>
      <TokenLogo tokenId={tokenId} />
    </TableCell>
    <NSTNameCell tokenId={tokenId} />
    <TableCell>-</TableCell>
    <TableCell>
      <FTAddressAmountCell addressHash={addressHash} tokenId={tokenId} />
    </TableCell>
    <TableCell align="right">-</TableCell>
  </TokenBalancesRow>
)
