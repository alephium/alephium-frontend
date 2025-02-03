import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import RadioButtonRow from '~/components/RadioButtonRow'
import BottomModalFlashList from '~/features/modals/BottomModalFlashList'
import { closeModal } from '~/features/modals/modalActions'
import withModal from '~/features/modals/withModal'
import { numberFormatRegionChanged } from '~/features/settings/regionSettings/regionSettingsActions'
import { regionOptions } from '~/features/settings/regionSettings/regionsUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const RegionSelectModal = withModal(({ id }) => {
  const dispatch = useAppDispatch()
  const { t } = useTranslation()
  const currentRegion = useAppSelector((s) => s.settings.region)

  const handleRegionChange = (region: string) => {
    dispatch(numberFormatRegionChanged(region))
    dispatch(closeModal({ id }))
    sendAnalytics({ event: 'Region changed', props: { region } })
  }

  return (
    <BottomModalFlashList
      modalId={id}
      title={t('Region')}
      flashListRender={(props) => (
        <FlashList
          data={regionOptions}
          estimatedItemSize={65}
          renderItem={({ item: regionOption, index }) => (
            <RadioButtonRow
              key={regionOption.label}
              title={regionOption.label}
              onPress={() => handleRegionChange(regionOption.value)}
              isActive={currentRegion === regionOption.value}
              isLast={index === regionOptions.length - 1}
            />
          )}
          {...props}
        />
      )}
    />
  )
})

export default RegionSelectModal
