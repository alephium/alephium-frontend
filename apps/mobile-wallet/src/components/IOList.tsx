import { AddressHash, GENESIS_TIMESTAMP } from '@alephium/shared'
import { explorer as e } from '@alephium/web3'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import styled from 'styled-components/native'

import AddressBadge from '~/components/AddressBadge'
import AppText from '~/components/AppText'
import { useAppSelector } from '~/hooks/redux'

interface IOListProps {
  currentAddress: AddressHash
  isOut: boolean
  timestamp?: number
  outputs?: e.Output[]
  inputs?: e.Input[]
}

const IOList = ({ currentAddress, isOut, timestamp, outputs, inputs }: IOListProps) => {
  const io = isOut ? outputs : inputs
  const addresses = useAppSelector((s) => s.addresses.entities)
  const { t } = useTranslation()

  if (io && io.length > 0) {
    const isAllCurrentAddress = io.every((o) => o.address === currentAddress)
    const notCurrentAddresses = _(io.filter((o) => o.address !== currentAddress))
      .map((v) => v.address)
      .uniq()
      .value()
    const addressHash = isAllCurrentAddress ? currentAddress : notCurrentAddresses[0]
    const extraAddressesText = notCurrentAddresses.length > 1 ? `(+${notCurrentAddresses.length - 1})` : ''

    if (!addressHash) return null

    const addressWithMetadata = addresses[addressHash]

    return (
      <View>
        <AddressBadge addressHash={addressWithMetadata?.hash ?? addressHash} />
        {extraAddressesText && <AppText>{extraAddressesText}</AppText>}
      </View>
    )
  } else if (timestamp === GENESIS_TIMESTAMP) {
    return <BoldText>{t('Genesis TX')}</BoldText>
  } else {
    return <BoldText>{t('Mining Rewards')}</BoldText>
  }
}

export default IOList

const BoldText = styled(AppText)`
  font-weight: 600;
`
