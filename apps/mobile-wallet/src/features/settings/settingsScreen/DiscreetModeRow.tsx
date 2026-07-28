import { AnalyticsEvent } from '@alephium/shared'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { discreetModeToggled } from '~/features/settings/settingsSlice'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const DiscreetModeRow = () => {
  const { t } = useTranslation()
  const discreetMode = useAppSelector((s) => s.settings.discreetMode)
  const dispatch = useAppDispatch()

  const toggleDiscreetMode = () => {
    dispatch(discreetModeToggled())
    sendAnalytics({ event: AnalyticsEvent.DISCREET_MODE_TOGGLED, props: { enabled: !discreetMode } })
  }

  return (
    <Row title={t('Discreet mode')} subtitle={t('Hide all amounts')}>
      <Toggle value={discreetMode} onValueChange={toggleDiscreetMode} />
    </Row>
  )
}

export default DiscreetModeRow
