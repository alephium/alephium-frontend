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

import { ALPH } from '@alephium/token-list'
import { explorer } from '@alephium/web3'
import { ReactElement, ReactNode } from 'react'

import { AddressLink } from './Links'

interface TransactionIOListProps {
  inputs?: explorer.Input[]
  outputs?: explorer.Output[]
  flex?: boolean
  addressMaxWidth?: string
  IOItemWrapper?: ({ children }: { children: ReactNode }) => ReactElement
}

const TransactionIOList = ({
  inputs = [],
  outputs = [],
  flex,
  addressMaxWidth,
  IOItemWrapper
}: TransactionIOListProps) => {
  const getAmounts = (io: explorer.Input | explorer.Output) => [
    { id: ALPH.id, amount: BigInt(io.attoAlphAmount ?? 0) },
    ...(io.tokens ? io.tokens.map((t) => ({ id: t.id, amount: BigInt(t.amount) })) : [])
  ]

  const renderLink = (IOAddressLink: ReactNode, addressHash: string, index: number) =>
    IOItemWrapper !== undefined ? (
      <IOItemWrapper key={`${addressHash}-${index}`}>{IOAddressLink}</IOItemWrapper>
    ) : (
      IOAddressLink
    )

  return (
    <>
      {inputs.map((input, i) =>
        !input.address
          ? null
          : renderLink(
              <AddressLink
                address={input.address}
                txHashRef={input.txHashRef}
                amounts={getAmounts(input)}
                maxWidth={addressMaxWidth}
                flex={flex}
              />,
              input.address,
              i
            )
      )}
      {outputs.map((output, i) =>
        !output.address
          ? null
          : renderLink(
              <AddressLink
                address={output.address}
                lockTime={(output as explorer.AssetOutput).lockTime}
                amounts={getAmounts(output)}
                maxWidth={addressMaxWidth}
                flex={flex}
              />,
              output.address,
              i
            )
      )}
    </>
  )
}

export default TransactionIOList
