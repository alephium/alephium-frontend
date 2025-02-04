import { FlashList } from '@shopify/flash-list'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import RadioButtonRow from '~/components/RadioButtonRow'
import BottomModalFlashList, { FlashListRenderProps } from '~/features/modals/BottomModalFlashList'
import { closeModal } from '~/features/modals/modalActions'
import { ModalInstance } from '~/features/modals/modalTypes'
import withModal from '~/features/modals/withModal'
import { numberFormatRegionChanged } from '~/features/settings/regionSettings/regionSettingsActions'
import { regionOptions } from '~/features/settings/regionSettings/regionsUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const RegionSelectModal = withModal(({ id }) => {
  const { t } = useTranslation()

  return (
    <BottomModalFlashList
      modalId={id}
      title={t('Region')}
      flashListRender={(props) => <RegionsFlashList parentModalId={id} {...props} />}
    />
  )
})

export default RegionSelectModal

const RegionsFlashList = ({
  parentModalId,
  ...props
}: FlashListRenderProps & { parentModalId: ModalInstance['id'] }) => (
  <FlashList
    data={regionOptions}
    estimatedItemSize={65}
    renderItem={({ item: { label, value }, index }) => (
      <RegionRadioButton
        label={label}
        value={value}
        isLast={index === regionOptions.length - 1}
        parentModalId={parentModalId}
      />
    )}
    {...props}
  />
)

interface RegionRadioButtonProps {
  label: string
  value: string
  isLast: boolean
  parentModalId: ModalInstance['id']
}

const RegionRadioButton = ({ label, value, isLast, parentModalId }: RegionRadioButtonProps) => {
  const dispatch = useAppDispatch()
  const currentRegion = useAppSelector((s) => s.settings.region)

  const handleRegionChange = (region: string) => {
    dispatch(numberFormatRegionChanged(region))
    dispatch(closeModal({ id: parentModalId }))
    sendAnalytics({ event: 'Region changed', props: { region } })
  }

  return (
    <RadioButtonRow
      key={label}
      title={label}
      onPress={() => handleRegionChange(value)}
      isActive={currentRegion === value}
      isLast={isLast}
    />
  )
}
