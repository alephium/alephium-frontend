import { AddressSettings } from '@alephium/shared'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, View } from 'react-native'

import ColorPicker from '~/components/inputs/ColorPicker'
import Input from '~/components/inputs/Input'
import Row from '~/components/Row'
import Toggle from '~/components/Toggle'

export type AddressFormData = AddressSettings

interface AddressFormProps {
  onValuesChange: (data: AddressFormData) => void
  screenTitle: string
  initialValues?: AddressFormData
  buttonText?: string
  disableIsMainToggle?: boolean
  isInModal?: boolean
}

const AddressForm = ({
  initialValues,
  onValuesChange,
  disableIsMainToggle = false,
  isInModal = false
}: AddressFormProps) => {
  const { t } = useTranslation()

  const [label, setLabel] = useState(initialValues?.label || '')
  const [color, setColor] = useState(initialValues?.color || '')
  const [isDefault, setIsDefault] = useState(initialValues?.isDefault || false)

  useEffect(() => {
    onValuesChange({ label, color, isDefault })
  }, [color, isDefault, label, onValuesChange])

  const toggleIsMain = () => {
    if (!disableIsMainToggle) {
      setIsDefault(!isDefault)
    }

    Keyboard.dismiss()
  }

  return (
    <View>
      <Row title={t('Label')}>
        <Input
          isInModal={isInModal}
          defaultValue={label}
          onChangeText={setLabel}
          label={t('Label')}
          maxLength={50}
          short
        />
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
    </View>
  )
}

export default AddressForm
