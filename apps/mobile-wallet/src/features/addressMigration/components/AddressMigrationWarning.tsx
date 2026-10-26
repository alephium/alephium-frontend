import { AddressMigrationOrigin, AnalyticsEvent } from '@alephium/shared'
import { selectAddressesInGroup } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { AddressGroup } from '@alephium/walletconnect-provider'
import { colord } from 'colord'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { useTheme } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import AddressMigrationButton from '~/features/addressMigration/AddressMigrationButton'
import { useAppSelector } from '~/hooks/redux'

interface AddressMigrationWarningProps {
  title: string
  description: string
  addressHash: AddressHash
  origin: AddressMigrationOrigin
  group?: AddressGroup
}

const AddressMigrationWarning = ({ title, description, addressHash, origin, group }: AddressMigrationWarningProps) => {
  const { t } = useTranslation()
  const theme = useTheme()
  const hasEligibleAddress = useAppSelector((s) => selectAddressesInGroup(s, group).length > 0)

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
      <AppText>
        {hasEligibleAddress
          ? `${description} ${t('Select a compatible address, or get the new address type.')}`
          : description}
      </AppText>
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
