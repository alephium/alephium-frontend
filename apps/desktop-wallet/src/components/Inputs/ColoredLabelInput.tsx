import { useEffect, useState } from 'react'
import styled from 'styled-components'

import ColorPicker from '@/components/Inputs/ColorPicker'
import Input from '@/components/Inputs/Input'

export type ColoredLabelInputValue = {
  title: string
  color: string
}

interface ColoredLabelInputProps {
  value: ColoredLabelInputValue
  onChange: ({ title, color }: ColoredLabelInputValue) => void
  disabled?: boolean
  label?: string
  id?: string
  maxLength?: number
  className?: string
}

const ColoredLabelInput = ({ label, onChange, value, className, id, maxLength }: ColoredLabelInputProps) => {
  const [title, setTitle] = useState(value.title)
  const [color, setColor] = useState(value.color)

  useEffect(() => {
    onChange({ title, color })
  }, [title, color, onChange])

  return (
    <>
      {label && <Label>{label}</Label>}
      <ColoredLabelInputStyled className={className}>
        <Input
          label={label}
          autoComplete="off"
          onChange={(e) => setTitle(e.target.value)}
          value={title}
          id={id}
          color={color}
          maxLength={maxLength}
        />
        <ColorPicker onChange={setColor} value={color} />
      </ColoredLabelInputStyled>
    </>
  )
}

export default ColoredLabelInput

const ColoredLabelInputStyled = styled.div`
  display: flex;
  gap: 17px;
  width: 100%;
  align-items: center;
  position: relative;
`

const Label = styled.label`
  font-size: 13px;
  font-weight: var(--fontWeight-semiBold);
`
