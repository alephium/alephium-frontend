import { AddressHash } from '@alephium/shared'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import AddressBadge from '@/components/AddressBadge'
import { inputDefaultStyle, InputLabel, InputProps } from '@/components/Inputs'
import { SelectOutterContainer } from '@/components/Inputs/Select'
import SelectMoreIcon from '@/components/Inputs/SelectMoreIcon'
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

    if (selectedAddressIsNotPartOfOptions) {
      const firstAddress = addressOptions.at(0)

      if (firstAddress) {
        onAddressChange(firstAddress)
      }
    }
  }, [onAddressChange, addressOptions, selectedAddress])

  if (!selectedAddress) return null

  return (
    <>
      <AddressSelectContainer
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
        {label && <InputLabel isElevated={!!selectedAddress}>{label}</InputLabel>}
        {!disabled && !simpleMode && <SelectMoreIcon />}
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
          <AddressBadge addressHash={selectedAddress} appendHash truncate />
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

const AddressSelectContainer = styled(SelectOutterContainer)<Pick<AddressSelectProps, 'disabled' | 'simpleMode'>>`
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
