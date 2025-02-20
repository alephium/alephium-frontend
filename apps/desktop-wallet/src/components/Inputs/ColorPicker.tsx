import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { CirclePicker } from 'react-color'
import { useDetectClickOutside } from 'react-detect-click-outside'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { fadeInOut } from '@/animations'
import { inputDefaultStyle, InputProps } from '@/components/Inputs'
import InputArea from '@/components/Inputs/InputArea'
import { getRandomLabelColor, labelColorPalette } from '@/utils/colors'
import { onEnterOrSpace } from '@/utils/misc'

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  const { t } = useTranslation()
  const color = value?.toString() || getRandomLabelColor()
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const ref = useDetectClickOutside({ onTriggered: () => setIsPopupOpen(false) })

  const handlePopupOpen = () => setIsPopupOpen(!isPopupOpen)
  const onChangeComplete = (newColor: { hex: string }) => {
    onChange(newColor.hex)
    handlePopupOpen()
  }

  return (
    <ColorPickerContainer ref={ref}>
      <InputAreaStyled
        aria-label={t('Pick a color')}
        onInput={handlePopupOpen}
        onClick={handlePopupOpen}
        onKeyDown={(e) => onEnterOrSpace(e, handlePopupOpen)}
      >
        <Color color={color} />
      </InputAreaStyled>
      <AnimatePresence>
        {isPopupOpen && (
          <Popup {...fadeInOut}>
            <CirclePicker color={color} onChangeComplete={onChangeComplete} colors={labelColorPalette} />
          </Popup>
        )}
      </AnimatePresence>
    </ColorPickerContainer>
  )
}

export default ColorPicker

const ColorPickerContainer = styled.div<InputProps>`
  position: relative;
  width: auto;
  display: inline-flex;
  flex-direction: column;
`

const InputAreaStyled = styled(InputArea)<InputProps>`
  ${({ isValid, value, label, Icon }) => inputDefaultStyle(isValid || !!Icon, !!value, !!label)}
  display: inline-flex;
  align-items: center;
  width: auto;
  cursor: pointer;
`

const Popup = styled(motion.div)`
  z-index: 1;
  position: absolute;
  top: calc(var(--inputHeight) + 10px);
  background-color: ${({ theme }) => theme.bg.background1};
  padding: 10px;
  border-radius: var(--radius-big);
  box-shadow: ${({ theme }) => theme.shadow.secondary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  right: 0;
`

const Color = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 16px;
  background-color: ${({ color }) => color};
`
