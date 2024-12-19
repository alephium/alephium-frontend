/*
Copyright 2018 - 2024 The Alephium Authors
This file is part of the alephium project.

The library is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

The library is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You should have received a copy of the GNU Lesser General Public License
along with the library. If not, see <http://www.gnu.org/licenses/>.
*/

import { AddressHash } from '@alephium/shared'
import { MoreVertical } from 'lucide-react'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import { inputDefaultStyle, InputLabel, InputProps } from '@/components/Inputs'
import { MoreIcon, SelectContainer } from '@/components/Inputs/Select'
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import AddressSelectModal from '@/modals/AddressSelectModal'
import { useMoveFocusOnPreviousModal } from '@/modals/ModalContainer'
import ModalPortal from '@/modals/ModalPortal'
import { onEnterOrSpace } from '@/utils/misc'

interface AddressSelectProps {
  id: string
  title: string
  addressOptions: AddressHash[]
  onAddressChange: (address: AddressHash) => void
  selectedAddress?: AddressHash
  label?: string
  disabled?: boolean
  simpleMode?: boolean
  noMargin?: boolean
  className?: string
  shouldDisplayAddressSelectModal?: boolean
}

function AddressSelect({
  addressOptions,
  title,
  label,
  disabled,
  selectedAddress,
  className,
  id,
  onAddressChange,
  noMargin,
  simpleMode = false
}: AddressSelectProps) {
  const moveFocusOnPreviousModal = useMoveFocusOnPreviousModal()

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [isAddressSelectModalOpen, setIsAddressSelectModalOpen] = useState(false)

  const handleAddressSelectModalClose = () => {
    setIsAddressSelectModalOpen(false)
    moveFocusOnPreviousModal()
  }

  const openAddressSelectModal = () => !disabled && setIsAddressSelectModalOpen(true)

  useEffect(() => {
    const selectedAddressIsNotPartOfOptions = !addressOptions.some((hash) => hash === selectedAddress)

    if (selectedAddressIsNotPartOfOptions) onAddressChange(addressOptions[0])
  }, [onAddressChange, addressOptions, selectedAddress])

  if (!selectedAddress) return null

  return (
    <>
      <AddressSelectContainer
        variants={sectionChildrenVariants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        onMouseDown={openAddressSelectModal}
        onKeyDown={(e) => onEnterOrSpace(e, openAddressSelectModal)}
        disabled={disabled}
        heightSize={simpleMode ? 'normal' : 'big'}
        simpleMode={simpleMode}
        noMargin={noMargin}
      >
        {label && (
          <InputLabel isElevated={!!selectedAddress} htmlFor={id}>
            {label}
          </InputLabel>
        )}
        {!disabled && !simpleMode && (
          <MoreIcon>
            <MoreVertical size={16} />
          </MoreIcon>
        )}
        <ClickableInput
          type="button"
          tabIndex={0}
          className={className}
          disabled={disabled}
          id={id}
          simpleMode={simpleMode}
          value={selectedAddress}
          label={label}
        >
          <AddressBadge addressHash={selectedAddress} appendHash />
        </ClickableInput>
      </AddressSelectContainer>
      <ModalPortal>
        {isAddressSelectModalOpen && (
          <AddressSelectModal
            title={title}
            addressOptions={addressOptions}
            onAddressSelect={onAddressChange}
            onClose={handleAddressSelectModalClose}
            defaultSelectedAddress={selectedAddress}
          />
        )}
      </ModalPortal>
    </>
  )
}

export default AddressSelect

const AddressSelectContainer = styled(SelectContainer)<Pick<AddressSelectProps, 'disabled' | 'simpleMode'>>`
  border: 2px solid ${({ theme }) => theme.border.primary};
  border-radius: 100px;
  height: 50px;

  ${({ disabled }) =>
    disabled &&
    css`
      cursor: not-allowed;
      box-shadow: none;
    `}

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      margin: 0;
      box-shadow: none;
    `}
`

const ClickableInput = styled.div<InputProps & Pick<AddressSelectProps, 'simpleMode'>>`
  ${({ isValid, Icon, simpleMode, value, label }) =>
    inputDefaultStyle(isValid || !!Icon, !!value, !!label, simpleMode ? 'normal' : 'big', true)};
  display: flex;
  align-items: center;
  padding-right: 50px;
  gap: var(--spacing-2);
  cursor: ${({ disabled }) => (disabled ? 'auto' : 'pointer')};

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      border: 0;
      height: calc(100% - 2px);
      background-color: transparent;

      &:hover {
        background-color: ${({ theme }) => theme.bg.hover};
      }
    `}
`
