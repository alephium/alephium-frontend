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
import { NumberFormatLocales, numberFormatRegionsOptions } from '@/features/settings/numberFormatLocales'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { numberFormatRegionChanged } from '@/storage/settings/settingsActions'

const NumberFormatSettings = () => {
  const { t } = useTranslation()
  const numberFormatRegion = useAppSelector((s) => s.settings.numberFormatRegion)
  const dispatch = useAppDispatch()
  const { sendAnalytics } = useAnalytics()

  const handleRegionSelect = (region: NumberFormatLocales) => {
    dispatch(numberFormatRegionChanged(region))

    sendAnalytics({ event: 'Number format changed', props: { region } })
  }

  return (
    <KeyValueInput
      label={t('Number format')}
      description={t('Choose how numbers are displayed.')}
      InputComponent={
        <Select
          id="numberFormat"
          options={numberFormatRegionsOptions}
          onSelect={handleRegionSelect}
          controlledValue={numberFormatRegionsOptions.find((region) => region.value === numberFormatRegion)}
          noMargin
          title={t('Number format')}
          heightSize="small"
        />
      }
    />
  )
}

export default NumberFormatSettings
