import { AddressSettings } from '@alephium/shared'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, View } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import ExpandableRow from '~/components/ExpandableRow'
import ColorPicker from '~/components/inputs/ColorPicker'
import Input from '~/components/inputs/Input'
import Surface from '~/components/layout/Surface'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'
import { openModal } from '~/features/modals/modalActions'
import { useAppDispatch } from '~/hooks/redux'
import { VERTICAL_GAP } from '~/style/globalStyle'

export type AddressFormData = AddressSettings & {
  group?: number
}

interface AddressFormProps {
  onValuesChange: (data: AddressFormData) => void
  screenTitle: string
  initialValues?: AddressFormData
  allowGroupSelection?: boolean
  buttonText?: string
  disableIsMainToggle?: boolean
}

const AddressForm = ({
  initialValues,
  onValuesChange,
  allowGroupSelection,
  disableIsMainToggle = false
}: AddressFormProps) => {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()

  const [label, setLabel] = useState(initialValues?.label || '')
  const [color, setColor] = useState(initialValues?.color || '')
  const [isDefault, setIsDefault] = useState(initialValues?.isDefault || false)
  const [group, setGroup] = useState<number>()

  useEffect(() => {
    onValuesChange({ label, color, isDefault, group })
  }, [color, group, isDefault, label, onValuesChange])

  const toggleIsMain = () => {
    if (!disableIsMainToggle) {
      setIsDefault(!isDefault)
    }

    Keyboard.dismiss()
  }

  const openGroupSelectModal = () => {
    dispatch(openModal({ name: 'GroupSelectModal', props: { onSelect: setGroup } }))

    Keyboard.dismiss()
  }

  return (
    <View style={{ flex: 1 }}>
      <Row title={t('Label')}>
        <Input value={label} onChangeText={setLabel} label={t('Label')} maxLength={50} short />
      </Row>
      <ColorPicker value={color} onChange={setColor} />
      <Row
        title={t('Default address')}
        subtitle={`${t('Default address for operations')}${
          disableIsMainToggle
            ? `. ${t('To remove this address from being the default address, you must set another one as main first.')}`
            : ''
        }`}
        onPress={toggleIsMain}
      >
        <Toggle onValueChange={toggleIsMain} value={isDefault} disabled={disableIsMainToggle} />
      </Row>
      {allowGroupSelection && (
        <AdvancedOptionSection>
          <Surface>
            <Row title={t('Address group')} onPress={openGroupSelectModal}>
              <AppText>
                {group !== undefined ? t('Group {{ groupNumber }}', { groupNumber: group }) : t('Default')}
              </AppText>
            </Row>
          </Surface>
        </AdvancedOptionSection>
      )}
    </View>
  )
}

export default AddressForm

const AdvancedOptionSection = styled(ExpandableRow)`
  margin-top: ${VERTICAL_GAP}px;
`
