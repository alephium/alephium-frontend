import { isFT, isNFT, TokenId } from '@alephium/shared'
import { useFetchToken } from '@alephium/shared-react'

import HashEllipsed from '@/components/HashEllipsed'

interface SelectOptionTokenNameProps {
  tokenId: TokenId
}

const SelectOptionTokenName = ({ tokenId }: SelectOptionTokenNameProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (token && isFT(token)) return `${token.name} (${token.symbol})`

  if (token && isNFT(token)) return token.name

  return <HashEllipsed hash={tokenId} />
}

export default SelectOptionTokenName
