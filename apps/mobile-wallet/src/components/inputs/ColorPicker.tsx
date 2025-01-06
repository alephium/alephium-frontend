import { memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleProp, ViewStyle } from 'react-native'
import styled from 'styled-components/native'

import AppText from '~/components/AppText'
import ModalWithBackdrop from '~/components/ModalWithBackdrop'
import HighlightRow from '~/components/Row'
import { BORDER_RADIUS, INPUTS_HEIGHT } from '~/style/globalStyle'
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

  return (
    <>
      <HighlightRow style={style} onPress={() => setIsModalVisible(!isModalVisible)}>
        <AppText>{t('Color')}</AppText>
        <Dot color={value} />
      </HighlightRow>
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

export default styled(ColorPicker)`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: ${BORDER_RADIUS}px;
`

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
