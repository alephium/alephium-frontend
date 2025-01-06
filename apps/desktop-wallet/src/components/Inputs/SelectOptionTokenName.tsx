import useFetchToken, { isFT, isNFT } from '@/api/apiDataHooks/token/useFetchToken'
import HashEllipsed from '@/components/HashEllipsed'
import { TokenId } from '@/types/tokens'

interface SelectOptionTokenNameProps {
  tokenId: TokenId
}

const SelectOptionTokenName = ({ tokenId }: SelectOptionTokenNameProps) => {
  const { data: token } = useFetchToken(tokenId)

  if (isFT(token)) return `${token.name} (${token.symbol})`

  if (isNFT(token)) return token.name

  return <HashEllipsed hash={token.id} />
}

export default SelectOptionTokenName
