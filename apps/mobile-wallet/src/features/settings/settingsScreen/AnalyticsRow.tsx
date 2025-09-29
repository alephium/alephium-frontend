import { useTranslation } from 'react-i18next'

import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { analyticsToggled } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const AnalyticsRow = () => {
  const { t } = useTranslation()
  const analytics = useAppSelector((s) => s.settings.analytics)
  const dispatch = useAppDispatch()

  const toggleAnalytics = () => dispatch(analyticsToggled())

  return (
    <Row title={t('Analytics')} subtitle={t('Help us improve your experience!')}>
      <Toggle value={analytics} onValueChange={toggleAnalytics} />
    </Row>
  )
}

export default AnalyticsRow
