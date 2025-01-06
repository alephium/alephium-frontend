import { AddressHash } from '@alephium/shared'
import { ReactNode } from 'react'

export interface TokenBalancesRowBaseProps {
  tokenId: string
}

export interface TokenBalancesRowAmountsProps extends TokenBalancesRowBaseProps {
  children: ReactNode
}

export interface AddressHashProp {
  addressHash: AddressHash
}

export type AddressTokenBalancesRowProps = AddressHashProp & TokenBalancesRowBaseProps

export type AddressTokenBalancesRowAmountsProps = AddressHashProp & TokenBalancesRowAmountsProps
