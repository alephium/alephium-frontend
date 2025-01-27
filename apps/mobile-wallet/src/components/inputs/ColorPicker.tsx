import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import Row from '~/components/Row'
import { INPUTS_HEIGHT } from '~/style/globalStyle'
import { labelColorPalette } from '~/utils/colors'

interface ColorPickerProps {
  onChange: (color: string) => void
  value?: string
  style?: StyleProp<ViewStyle>
}

const ColorPicker = ({ value, onChange, style }: ColorPickerProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false)
  const { t } = useTranslation()

  const handleColorPress = (color: string) => {
    onChange(color)
    setIsModalVisible(false)
  }

  const handleRowPress = () => {
    setIsModalVisible(!isModalVisible)
    Keyboard.dismiss()
  }

  return (
    <>
      <Row style={style} title={t('Color')} onPress={handleRowPress}>
        <Dot color={value} />
      </Row>
      <ModalWithBackdrop
        animationType="fade"
        visible={isModalVisible}
        closeModal={() => setIsModalVisible(false)}
        showCloseButton
      >
        <Colors>
          {labelColorPalette.map((c) => (
            <Color key={c} color={c} onPress={() => handleColorPress(c)} />
          ))}
        </Colors>
      </ModalWithBackdrop>
    </>
  )
}

export default ColorPicker

const Dot = styled.View<{ color?: string }>`
  height: 15px;
  width: 15px;
  border-radius: 15px;
  background-color: ${({ color, theme }) => color ?? theme.font.primary};
`

const Colors = styled.View`
  width: 100%;
  height: 100%;
`

const Color = memo(styled.Pressable<{ color: string }>`
  background-color: ${({ color }) => color};
  width: 100%;
  flex: 1;
  min-height: ${INPUTS_HEIGHT}px;
  padding: 20px;
`)
