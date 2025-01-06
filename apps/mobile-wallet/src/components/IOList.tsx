import { GENESIS_TIMESTAMP } from '@alephium/shared'
import { explorer } from '@alephium/web3'
import _ from 'lodash'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()

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
    return <BoldText>{t('Genesis TX')}</BoldText>
  } else {
    return <BoldText>{t('Mining Rewards')}</BoldText>
  }
}

export default IOList

const BoldText = styled(AppText)`
  font-weight: 600;
`
