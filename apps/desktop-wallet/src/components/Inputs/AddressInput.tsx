import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import { InputProps, inputStyling } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import { useAppSelector } from '@/hooks/redux'
import { makeSelectContactByAddress, selectAddressByHash } from '@/storage/addresses/addressesSelectors'

type InputFieldMode = 'view' | 'edit'

const AddressInput = ({ value, ...props }: InputProps) => {
  const addressHashInput = value?.toString() || ''
  const ownAddress = useAppSelector((s) => selectAddressByHash(s, addressHashInput))
  const selectContactByAddress = useMemo(() => makeSelectContactByAddress(), [])
  const contact = useAppSelector((s) => selectContactByAddress(s, addressHashInput))
  const inputRef = useRef<HTMLInputElement>(null)

  const [inputFieldMode, setInputFieldMode] = useState<InputFieldMode>('view')

  const isAddressLabelVisible = (contact || ownAddress) && inputFieldMode === 'view'

  const handleFocus = () => {
    inputRef.current?.focus()
    setInputFieldMode('edit')
  }

  const handleBlur = () => {
    setInputFieldMode('view')
  }

  return (
    <InputStyled
      value={ownAddress ? ownAddress.hash : contact ? contact.address : value}
      inputFieldRef={inputRef}
      onFocus={handleFocus}
      onBlur={handleBlur}
      inputFieldStyle={{
        color: isAddressLabelVisible ? 'transparent' : undefined,
        transition: 'all 0.2s ease-out'
      }}
      largeText
      {...props}
    >
      {isAddressLabelVisible && (
        <InputStaticOverlay>
          <AddressBadge addressHash={addressHashInput} appendHash truncate />
        </InputStaticOverlay>
      )}
    </InputStyled>
  )
}

export default AddressInput

const InputStyled = styled(Input)`
  position: relative;
`

const InputStaticOverlay = styled(motion.div)`
  display: flex;
  gap: var(--spacing-2);
  position: absolute;
  height: 100%;
  align-items: center;
  top: 0;
  left: 0;
  transition: opacity 0.2s ease-out;
  pointer-events: none;
  width: 100%;
  padding: 0 ${inputStyling.paddingLeftRight};
  padding-right: 50px;
`
