import { AddressMigrationOrigin, AnalyticsEvent } from '@alephium/shared'
import { AddressHash } from '@alephium/shared/types'
import { colord } from 'colord'
import { useEffect } from 'react'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import AddressMigrationButton from '~/features/addressMigration/AddressMigrationButton'

interface AddressMigrationWarningProps {
  title: string
  description: string
  addressHash: AddressHash
  origin: AddressMigrationOrigin
}

const AddressMigrationWarning = ({ title, description, addressHash, origin }: AddressMigrationWarningProps) => {
  const theme = useTheme()

  useEffect(() => {
    sendAnalytics({ event: AnalyticsEvent.ADDRESS_MIGRATION_OFFERED, props: { origin } })
  }, [origin])

  return (
    <InfoBox
      narrow
      title={title}
      iconName="alert-circle"
      bgColor={colord(theme.global.warning).alpha(0.15).toHex()}
      iconColor={theme.global.warning}
    >
      <AppText>{description}</AppText>
      <ButtonRow>
        <AddressMigrationButton addressHash={addressHash} origin={origin} />
      </ButtonRow>
    </InfoBox>
  )
}

export default AddressMigrationWarning

const ButtonRow = styled.View`
  margin-top: 16px;
  align-items: flex-start;
`
