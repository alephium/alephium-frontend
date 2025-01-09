import { AddressSettings } from '@alephium/shared'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

import AppText from '~/components/AppText'
import BottomButtons from '~/components/buttons/BottomButtons'
import Button from '~/components/buttons/Button'
import ExpandableRow from '~/components/ExpandableRow'
import ColorPicker from '~/components/inputs/ColorPicker'
import Input from '~/components/inputs/Input'
import { ScreenSection } from '~/components/layout/Screen'
import { ScrollScreenProps } from '~/components/layout/ScrollScreen'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'

export type AddressFormData = AddressSettings & {
  group?: number
}

interface AddressFormProps extends ScrollScreenProps {
  initialValues: AddressFormData
  onSubmit: (data: AddressFormData) => void
  screenTitle: string
  allowGroupSelection?: boolean
  buttonText?: string
  disableIsMainToggle?: boolean
  HeaderComponent?: ReactNode
}

const AddressForm = ({
  initialValues,
  onSubmit,
  screenTitle,
  allowGroupSelection,
  buttonText,
  disableIsMainToggle = false,
  HeaderComponent,
  headerOptions,
  ...props
}: AddressFormProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [label, setLabel] = useState(initialValues.label)
  const [color, setColor] = useState(initialValues.color)
  const [isDefault, setIsDefault] = useState(initialValues.isDefault)
  const [group, setGroup] = useState<number>()

  const toggleIsMain = () => {
    if (!disableIsMainToggle) {
      setIsDefault(!isDefault)
    }
  }

  const openGroupSelectModal = () => dispatch(openModal({ name: 'GroupSelectModal', props: { onSelect: setGroup } }))

  return (
    <>
      <View style={{ flex: 1 }}>
        <ScreenSection verticalGap fill>
          <View>{HeaderComponent}</View>
          <Input value={label} onChangeText={setLabel} label={t('Label')} maxLength={50} />

          <ColorPicker value={color} onChange={setColor} />
          <Surface>
            <Row
              title={t('Default address')}
              subtitle={`${t('Default address for operations')}${
                disableIsMainToggle
                  ? `. ${t(
                      'To remove this address from being the default address, you must set another one as main first.'
                    )}`
                  : ''
              }`}
              onPress={toggleIsMain}
              isLast
            >
              <Toggle onValueChange={toggleIsMain} value={isDefault} disabled={disableIsMainToggle} />
            </Row>
          </Surface>
          {allowGroupSelection && (
            <ExpandableRow>
              <Surface>
                <Row title={t('Address group')} onPress={openGroupSelectModal}>
                  <AppText>
                    {group !== undefined ? t('Group {{ groupNumber }}', { groupNumber: group }) : t('Default')}
                  </AppText>
                </Row>
              </Surface>
            </ExpandableRow>
          )}
        </ScreenSection>
      </View>
      <ScreenSection>
        <BottomButtons fullWidth backgroundColor="back1">
          <Button
            title={buttonText || t('Generate')}
            variant="highlight"
            onPress={() => onSubmit({ isDefault, label, color, group })}
          />
        </BottomButtons>
      </ScreenSection>
    </>
  )
}

export default AddressForm
