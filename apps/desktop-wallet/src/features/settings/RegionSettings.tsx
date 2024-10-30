/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { useTranslation } from 'react-i18next'

import KeyValueInput from '@/components/Inputs/InlineLabelValueInput'
import Select from '@/components/Inputs/Select'
import useAnalytics from '@/features/analytics/useAnalytics'
import useRegionOptions from '@/features/settings/useRegionOptions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { numberFormatRegionChanged } from '@/features/settings/settingsActions'

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
