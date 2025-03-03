import useFetchToken from '@/api/apiDataHooks/token/useFetchToken'
import HashEllipsed from '@/components/HashEllipsed'
import { isFT, isNFT, TokenId } from '@/types/tokens'

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
