import { selectAllAddresses } from '@alephium/shared/store'
import { colord } from 'colord'
import { useTranslation } from 'react-i18next'
import { useTheme } from 'styled-components/native'

import { canAddressUsePowfi } from '~/api/powfi'
import AppText from '~/components/AppText'
import InfoBox from '~/components/InfoBox'
import { useAppSelector } from '~/hooks/redux'

const StakingAddressGroupWarning = () => {
  const { t } = useTranslation()
  const theme = useTheme()
  const hasEligibleAddress = useAppSelector((s) => selectAllAddresses(s).some(canAddressUsePowfi))

  return (
    <InfoBox
      narrow
      title={t('This address cannot stake')}
      iconName="alert-circle"
      bgColor={colord(theme.global.warning).alpha(0.15).toHex()}
      iconColor={theme.global.warning}
    >
      <AppText>
        {hasEligibleAddress
          ? t(
              'Powfi staking only works with groupless addresses and addresses in group 0. Please, select another address.'
            )
          : t(
              'Powfi staking only works with groupless addresses and addresses in group 0. Please, create a new groupless address and select it here.'
            )}
      </AppText>
    </InfoBox>
  )
}

export default StakingAddressGroupWarning
