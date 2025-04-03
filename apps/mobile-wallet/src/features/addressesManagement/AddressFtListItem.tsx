import { AddressHash, TokenId } from '@alephium/shared'
import { useFetchAddressSingleTokenBalances } from '@alephium/shared-react'
import { View } from 'react-native'

import FtBalance from '~/components/tokensLists/FtBalance'
import FtListItem, { FtListItemProps } from '~/components/tokensLists/FtListItem'
import FtWorth from '~/components/tokensLists/FtWorth'

interface AddressFtProps {
  tokenId: TokenId
  addressHash: AddressHash
}

type AddressFtListItemProps = FtListItemProps & AddressFtProps

const AddressFtListItem = (props: AddressFtListItemProps) => {
  const { tokenId, addressHash } = props
  const { data: tokenBalances } = useFetchAddressSingleTokenBalances({ addressHash, tokenId })

  const balance = tokenBalances?.totalBalance ? BigInt(tokenBalances.totalBalance) : undefined

  return (
    <FtListItem
      rightSideContent={
        <View>
          <FtBalance tokenId={tokenId} balance={balance} />
          <FtWorth tokenId={tokenId} balance={balance} />
        </View>
      }
      {...props}
    />
  )
}

export default AddressFtListItem
