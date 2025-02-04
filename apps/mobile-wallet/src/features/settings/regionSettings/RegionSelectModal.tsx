import { FlashList } from '@shopify/flash-list'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { sendAnalytics } from '~/analytics'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import SearchInput from '~/components/SearchInput'
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
      keyboardAvoidingViewBehavior="padding"
    />
  )
})

export default RegionSelectModal

const RegionsFlashList = ({
  parentModalId,
  ...props
}: FlashListRenderProps & { parentModalId: ModalInstance['id'] }) => {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRegionOptions = useMemo(
    () => regionOptions.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase())),
    [searchQuery]
  )

  return (
    <>
      <ScreenSection>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
      </ScreenSection>
      <FlashList
        data={filteredRegionOptions}
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
    </>
  )
}

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
