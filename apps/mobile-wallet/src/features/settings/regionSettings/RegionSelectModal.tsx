import { FlashList } from '@shopify/flash-list'
import { memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import styled, { css } from 'styled-components/native'

import { sendAnalytics } from '~/analytics'
import { ScreenSection } from '~/components/layout/Screen'
import RadioButtonRow from '~/components/RadioButtonRow'
import SearchInput from '~/components/SearchInput'
import BottomModalFlashList, { FlashListRenderProps } from '~/features/modals/BottomModalFlashList'
import { closeModal } from '~/features/modals/modalActions'
import { useModalContext } from '~/features/modals/ModalContext'
import { ModalInstance } from '~/features/modals/modalTypes'
import { numberFormatRegionChanged } from '~/features/settings/regionSettings/regionSettingsActions'
import { regionOptions } from '~/features/settings/regionSettings/regionsUtils'
import { useAppDispatch, useAppSelector } from '~/hooks/redux'

const RegionSelectModal = memo(() => {
  const { t } = useTranslation()
  const { id } = useModalContext()

  return (
    <BottomModalFlashList
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
      <ScreenSectionStyled position={Platform.OS === 'ios' ? 'top' : 'bottom'}>
        <SearchInput value={searchQuery} onChangeText={setSearchQuery} />
      </ScreenSectionStyled>
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

const ScreenSectionStyled = styled(ScreenSection)<{ position: 'top' | 'bottom' }>`
  ${({ position }) =>
    position === 'bottom' &&
    css`
      position: absolute;
      right: 0;
      left: 0;
      bottom: 0;
      z-index: 1;
      background-color: ${({ theme }) => theme.bg.back1};
    `}
`
