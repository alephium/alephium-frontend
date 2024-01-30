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

import { GENESIS_TIMESTAMP } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import _ from 'lodash'
import { View } from 'react-native'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'
import { AddressConfirmedTransaction } from '~/types/transactions'

interface IOListProps {
  isOut: boolean
  tx: AddressConfirmedTransaction
}

const IOList = ({ isOut, tx }: IOListProps) => {
  const io = (isOut ? tx.outputs : tx.inputs) as Array<explorer.Output | explorer.Input> | undefined
  const addresses = useAppSelector((s) => s.addresses.entities)

  if (io && io.length > 0) {
    const isAllCurrentAddress = io.every((o) => o.address === tx.address.hash)
    const notCurrentAddresses = _(io.filter((o) => o.address !== tx.address.hash))
      .map((v) => v.address)
      .uniq()
      .value()
    const addressHash = isAllCurrentAddress ? tx.address.hash : notCurrentAddresses[0]
    const extraAddressesText = notCurrentAddresses.length > 1 ? `(+${notCurrentAddresses.length - 1})` : ''

    if (!addressHash) return null

    const addressWithMetadata = addresses[addressHash]

    return (
      <View>
        <AddressBadge addressHash={addressWithMetadata?.hash ?? addressHash} />
        {extraAddressesText && <AppText>{extraAddressesText}</AppText>}
      </View>
    )
  } else if (tx.timestamp === GENESIS_TIMESTAMP) {
    return <BoldText>Genesis TX</BoldText>
  } else {
    return <BoldText>Mining Rewards</BoldText>
  }
}

export default IOList

const BoldText = styled(AppText)`
  font-weight: 600;
`
