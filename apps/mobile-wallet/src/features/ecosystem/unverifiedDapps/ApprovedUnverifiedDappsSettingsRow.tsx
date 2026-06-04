import { useTranslation } from 'react-i18next'

import Badge from '~/components/Badge'
import Button from '~/components/buttons/Button'
import Row from '~/components/Row'
import {
  clearAcknowledgedUnverifiedDapps,
  useAcknowledgedUnverifiedDappsCount
} from '~/features/ecosystem/unverifiedDapps/acknowledgedUnverifiedDappsStorage'
import { useAppSelector } from '~/hooks/redux'

const ApprovedUnverifiedDappsSettingsRow = () => {
  const handleClearUnverifiedDapps = () => clearAcknowledgedUnverifiedDapps(walletId)
  const walletId = useAppSelector((s) => s.wallet.id)
  const acknowledgedUnverifiedDappsCount = useAcknowledgedUnverifiedDappsCount(walletId)
  const { t } = useTranslation()

  return (
    <Row title={t('Approved unverified dApps')} subtitle={t('Clear all approvals')} isLast>
      <Badge>{acknowledgedUnverifiedDappsCount}</Badge>
      <Button
        title={t('Clear')}
        short
        onPress={handleClearUnverifiedDapps}
        disabled={acknowledgedUnverifiedDappsCount === 0}
      />
    </Row>
  )
}

export default ApprovedUnverifiedDappsSettingsRow
