import styled from 'styled-components'

import Button, { ButtonProps } from '@/components/Button'
import Popup, { PopupProps, useElementAnchorCoordinates } from '@/components/Popup'
import ModalPortal from '@/modals/ModalPortal'

interface DropdownProps extends ButtonProps {
  options: Array<DropdownOption>
}

export interface DropdownOption {
  label: string
  onClick: () => void
}

const DropdownButton = ({ options, ...props }: DropdownProps) => {
  const { containerRef, hookCoordinates, openModal, closeModal, isModalOpen } = useElementAnchorCoordinates()

  return (
    <div ref={containerRef}>
      <Button onClick={openModal} {...props} />
      <ModalPortal>
        {isModalOpen && <DropdownMenuModal options={options} hookCoordinates={hookCoordinates} onClose={closeModal} />}
      </ModalPortal>
    </div>
  )
}

export default DropdownButton

const DropdownMenuModal = ({ options, ...props }: Pick<DropdownProps, 'options'> & PopupProps) => {
  const handleMenuItemClick = (option: DropdownOption) => {
    option.onClick()
    props.onClose()
  }

  return (
    <Popup {...props}>
      {options.map((option) => (
        <MenuItem key={option.label} onClick={() => handleMenuItemClick(option)} transparent>
          {option.label}
        </MenuItem>
      ))}
    </Popup>
  )
}

const MenuItem = styled(Button)`
  padding: var(--spacing-3);
  border-radius: 0;
  margin: 0;
  width: 100%;
`
