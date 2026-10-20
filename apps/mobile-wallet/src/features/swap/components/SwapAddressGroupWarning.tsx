import { selectAllAddresses } from '@alephium/shared/store'
import { AddressHash } from '@alephium/shared/types'
import { useTranslation } from 'react-i18next'

import { canAddressUsePowfi } from '~/api/powfi'
import AddressMigrationWarning from '~/features/addressMigration/components/AddressMigrationWarning'
import { useAppSelector } from '~/hooks/redux'

interface SwapAddressGroupWarningProps {
  addressHash: AddressHash
}

const SwapAddressGroupWarning = ({ addressHash }: SwapAddressGroupWarningProps) => {
  const { t } = useTranslation()
  const hasEligibleAddress = useAppSelector((s) => selectAllAddresses(s).some(canAddressUsePowfi))

  return (
    <AddressMigrationWarning
      title={t('This address cannot swap')}
      description={
        hasEligibleAddress
          ? t("Swapping requires Alephium's new address type. Select another address, or get one now.")
          : t("Swapping requires Alephium's new address type.")
      }
      addressHash={addressHash}
      origin="swap"
    />
  )
}

export default SwapAddressGroupWarning
