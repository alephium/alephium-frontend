import { useTranslation } from 'react-i18next'

import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Select from '@/components/Inputs/Select'
import useAnalytics from '@/features/analytics/useAnalytics'
import { numberFormatRegionChanged } from '@/features/settings/settingsActions'
import useRegionOptions from '@/features/settings/useRegionOptions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

const RegionSettings = () => {
  const { t } = useTranslation()
  const currentRegion = useAppSelector((s) => s.settings.region)
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()
  const regionOptions = useRegionOptions()

  const handleRegionSelect = (region: string) => {
    dispatch(numberFormatRegionChanged(region))

    sendAnalytics({ event: 'Region changed', props: { region } })
  }

  return (
    <KeyValueInput
      label={t('Region')}
      description={t('Choose your region to update formats of dates, time, and currencies.')}
      noHorizontalPadding
      InputComponent={
        <Select
          id="region"
          options={regionOptions}
          onSelect={handleRegionSelect}
          controlledValue={regionOptions.find((region) => region.value === currentRegion)}
          noMargin
          title={t('Region')}
          heightSize="small"
          isSearchable
        />
      }
    />
  )
}

export default RegionSettings
