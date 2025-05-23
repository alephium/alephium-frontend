import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import Button from '@/components/Button'
import CheckMark from '@/components/CheckMark'
import { inputDefaultStyle, SelectLabel } from '@/components/Inputs'
import InputArea from '@/components/Inputs/InputArea'
import { OptionItem, OptionSelect } from '@/components/Inputs/Select'
import SelectMoreIcon from '@/components/Inputs/SelectMoreIcon'
import Popup from '@/components/Popup'
import Truncate from '@/components/Truncate'
import ModalPortal from '@/modals/ModalPortal'
import { onEnterOrSpace, removeItemFromArray } from '@/utils/misc'

interface MultiSelectOptionsProps<T> {
  options: T[]
  selectedOptions: T[]
  selectedOptionsSetter: (options: T[]) => void
  getOptionId: (option: T) => string
  getOptionText: (option: T) => string
  modalTitle: string
  renderOption?: (option: T, isSelected?: boolean) => ReactNode
}

interface MultiSelectProps<T> extends MultiSelectOptionsProps<T> {
  label: string
  renderSelectedValue: () => ReactNode
  className?: string
}

interface MultiSelectOptionsModalProps<T> extends MultiSelectOptionsProps<T> {
  onClose: () => void
}

function MultiSelect<T>({ selectedOptions, label, renderSelectedValue, className, ...props }: MultiSelectProps<T>) {
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false)

  const openOptionsModal = () => setIsOptionsModalOpen(true)

  return (
    <>
      <MultiSelectInputArea
        className={className}
        onMouseDown={openOptionsModal}
        onKeyDown={(e) => onEnterOrSpace(e, openOptionsModal)}
      >
        <SelectLabel>{label}</SelectLabel>
        <SelectedValue>
          <Truncate>{renderSelectedValue()}</Truncate>
        </SelectedValue>
        <SelectMoreIcon />
      </MultiSelectInputArea>
      <ModalPortal>
        {isOptionsModalOpen && (
          <MultiSelectOptionsModal
            selectedOptions={selectedOptions}
            onClose={() => setIsOptionsModalOpen(false)}
            {...props}
          />
        )}
      </ModalPortal>
    </>
  )
}

export function MultiSelectOptionsModal<T>({
  options,
  selectedOptions,
  renderOption,
  getOptionId,
  getOptionText,
  modalTitle,
  onClose,
  selectedOptionsSetter
}: MultiSelectOptionsModalProps<T>) {
  const { t } = useTranslation()

  const allOptionsAreSelected = selectedOptions.length === options.length

  const handleOptionClick = (optionClicked: T) => {
    const index = selectedOptions.findIndex((option) => getOptionId(option) === getOptionId(optionClicked))

    index !== -1
      ? selectedOptionsSetter(removeItemFromArray(selectedOptions, index))
      : selectedOptionsSetter([optionClicked, ...selectedOptions])
  }

  const handleAllButtonsClick = () => {
    selectedOptions.length === options.length ? selectedOptionsSetter([]) : selectedOptionsSetter(options)
  }

  return (
    <Popup
      title={modalTitle}
      onClose={onClose}
      minWidth={500}
      extraHeaderContent={
        <AllButton role="secondary" short onClick={handleAllButtonsClick}>
          {allOptionsAreSelected ? t('Unselect all') : t('Select all')}
        </AllButton>
      }
    >
      <OptionSelect>
        {options.map((option) => {
          const isSelected = selectedOptions.some((o) => getOptionId(o) === getOptionId(option))
          return (
            <OptionItem
              key={getOptionId(option)}
              tabIndex={0}
              role="listitem"
              onClick={() => handleOptionClick(option)}
              selected={isSelected}
              focusable
              aria-label={getOptionText(option)}
              hasCustomOptionRender={!!renderOption}
            >
              {renderOption ? (
                <CustomOptionContainer isSelected={isSelected}>
                  {renderOption(option, isSelected)}
                  {isSelected && <CheckMark />}
                </CustomOptionContainer>
              ) : (
                <>
                  {getOptionText(option)}
                  {isSelected && <CheckMark />}
                </>
              )}
            </OptionItem>
          )
        })}
      </OptionSelect>
    </Popup>
  )
}

export default MultiSelect

const MultiSelectInputArea = styled(InputArea)`
  ${inputDefaultStyle(true, true, false)};
  gap: 10px;
`

const SelectedValue = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 200px;
`

const AllButton = styled(Button)`
  margin: var(--spacing-2) 0;
  margin-left: auto;
`

const CustomOptionContainer = styled.div<{ isSelected: boolean }>`
  flex: 1;
  display: flex;

  ${CheckMark} {
    margin: 12px 8px 12px 4px;
  }

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.bg.accent};
    `}
`
