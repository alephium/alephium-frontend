/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

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
