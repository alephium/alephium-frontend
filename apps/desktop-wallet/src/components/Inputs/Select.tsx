import { colord } from 'colord'
import { useInView } from 'framer-motion'
import { isEqual } from 'lodash'
import { SearchIcon } from 'lucide-react'
import {
  KeyboardEvent as ReactKeyboardEvent,
  OptionHTMLAttributes,
  ReactNode,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import CheckMark from '@/components/CheckMark'
import { inputDefaultStyle, InputHeight, InputProps, inputStyling, SelectLabel } from '@/components/Inputs'
import Input from '@/components/Inputs/Input'
import InputArea from '@/components/Inputs/InputArea'
import SelectMoreIcon from '@/components/Inputs/SelectMoreIcon'
import Popup, { useElementAnchorCoordinates } from '@/components/Popup'
import Truncate from '@/components/Truncate'
import ModalPortal from '@/modals/ModalPortal'
import { Coordinates } from '@/types/numbers'

type Writable<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends undefined
      ? undefined
      : T extends readonly (infer U)[]
        ? U
        : never

export type OptionValue = Writable<OptionHTMLAttributes<HTMLOptionElement>['value']>

export interface SelectOption<T extends OptionValue> {
  value: T
  label: string
  searchString?: string
}

interface SelectProps<T extends OptionValue> {
  label?: string
  disabled?: boolean
  controlledValue?: SelectOption<T>
  options: SelectOption<T>[]
  optionRender?: (option: SelectOption<T>, isSelected?: boolean) => ReactNode
  title?: string
  id: string
  onSelect: (value: T) => void
  raised?: boolean
  contrast?: boolean
  skipEqualityCheck?: boolean
  noMargin?: boolean
  className?: string
  simpleMode?: boolean
  heightSize?: InputHeight
  renderCustomComponent?: (value?: SelectOption<T>, disablePointer?: boolean) => ReactNode
  ListBottomComponent?: ReactNode
  allowReselectionOnClickWhenSingleOption?: boolean
  isSearchable?: boolean
  allowCustomValue?: boolean
}

function Select<T extends OptionValue>({
  options,
  optionRender,
  title,
  label,
  disabled,
  controlledValue,
  id,
  onSelect,
  raised,
  contrast,
  skipEqualityCheck = false,
  noMargin,
  simpleMode,
  className,
  heightSize,
  renderCustomComponent,
  ListBottomComponent,
  allowReselectionOnClickWhenSingleOption,
  isSearchable,
  allowCustomValue
}: SelectProps<T>) {
  const [value, setValue] = useState(controlledValue)
  const { containerRef, hookCoordinates, openModal, closeModal, isModalOpen } = useElementAnchorCoordinates()

  const multipleAvailableOptions = options.length > 1

  const setInputValue = useCallback(
    (option: SelectOption<T>) => {
      if (!value || !isEqual(option, value) || skipEqualityCheck) {
        onSelect(option.value)
        setValue(option)

        containerRef.current?.focus()
      }
    },
    [containerRef, onSelect, skipEqualityCheck, value]
  )

  const handleClick = () => {
    if (!multipleAvailableOptions && !allowReselectionOnClickWhenSingleOption) {
      allowReselectionOnClickWhenSingleOption && options.length === 1 && onSelect(options[0].value)

      return
    }

    openModal()
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (![' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    if (!multipleAvailableOptions) return

    openModal()
  }

  useEffect(() => {
    // Controlled component
    if ((controlledValue && !isEqual(controlledValue, value)) || skipEqualityCheck) {
      setValue(controlledValue)
    }
  }, [controlledValue, setInputValue, skipEqualityCheck, value])

  useEffect(() => {
    // If only one value, select it
    if (!value && options.length === 1) {
      setInputValue(options[0])
    }
  }, [options, setInputValue, value])

  useEffect(() => {
    if (!allowCustomValue && value && !options.find((option) => option.value === value.value)) {
      setValue(undefined)
    }
  }, [allowCustomValue, options, value])

  return (
    <>
      <SelectOutterContainer
        custom={disabled}
        noMargin={noMargin}
        onMouseDown={handleClick}
        onKeyDown={handleKeyDown}
        style={{ zIndex: raised && isModalOpen ? 2 : undefined, boxShadow: disabled ? 'none' : undefined }}
        heightSize={heightSize}
        simpleMode={simpleMode}
        tabIndex={renderCustomComponent ? -1 : 0}
        showPointer={multipleAvailableOptions}
      >
        {renderCustomComponent ? (
          <CustomComponentContainer ref={containerRef}>
            {renderCustomComponent(value, !multipleAvailableOptions)}
          </CustomComponentContainer>
        ) : (
          <>
            {multipleAvailableOptions && !simpleMode && <SelectMoreIcon />}
            <SelectContainer
              tabIndex={-1}
              className={className}
              ref={containerRef}
              id={id}
              simpleMode={simpleMode}
              label={label}
              heightSize={heightSize}
              contrast={contrast}
              showPointer={multipleAvailableOptions}
            >
              {label && <SelectLabel htmlFor={id}>{label}</SelectLabel>}
              <Truncate>{value?.label}</Truncate>
            </SelectContainer>
          </>
        )}
      </SelectOutterContainer>
      <ModalPortal>
        {isModalOpen && (
          <SelectOptionsModal
            options={options}
            optionRender={optionRender}
            selectedOption={value}
            setValue={setInputValue}
            title={title}
            hookCoordinates={hookCoordinates}
            onClose={closeModal}
            parentSelectRef={containerRef}
            ListBottomComponent={ListBottomComponent}
            isSearchable={isSearchable}
          />
        )}
      </ModalPortal>
    </>
  )
}

interface SelectOptionsModalProps<T extends OptionValue> {
  options: SelectOption<T>[]
  selectedOption?: SelectOption<T>
  setValue: (value: SelectOption<T>) => void | undefined
  onClose: () => void
  hookCoordinates?: Coordinates
  title?: string
  optionRender?: (option: SelectOption<T>, isSelected: boolean) => ReactNode
  searchPlaceholder?: string
  emptyListPlaceholder?: string
  parentSelectRef?: RefObject<HTMLDivElement | HTMLButtonElement>
  minWidth?: number
  ListBottomComponent?: ReactNode
  isSearchable?: boolean
}

export function SelectOptionsModal<T extends OptionValue>({
  options,
  selectedOption,
  setValue,
  onClose,
  hookCoordinates,
  title,
  optionRender,
  searchPlaceholder,
  emptyListPlaceholder,
  parentSelectRef,
  minWidth,
  ListBottomComponent,
  isSearchable
}: SelectOptionsModalProps<T>) {
  const { t } = useTranslation()
  const optionSelectRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const [searchInput, setSearchInput] = useState('')
  const filteredOptions =
    searchInput.length > 2
      ? options.filter((option) =>
          option.searchString
            ? option.searchString.includes(searchInput)
            : option.label.toLocaleLowerCase().includes(searchInput)
        )
      : options
  const isEmpty = options.length === 0 && emptyListPlaceholder
  const emptySearchResults = filteredOptions.length === 0 && isSearchable

  const handleOptionSelect = useCallback(
    (value: T) => {
      const selectedValue = filteredOptions.find((o) => o.value === value)
      if (!selectedValue) return

      setValue(selectedValue)
      onClose()
    },
    [onClose, filteredOptions, setValue]
  )

  const parentSelectWidth = parentSelectRef?.current?.clientWidth
  const width = minWidth
    ? minWidth
    : parentSelectWidth !== undefined && parentSelectWidth > 200
      ? parentSelectWidth + 10
      : undefined

  useEffect(() => {
    // Delay to attract attention
    const timer = setTimeout(() => searchInputRef.current?.focus(), 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <Popup
      title={title}
      onClose={onClose}
      hookCoordinates={hookCoordinates}
      minWidth={width}
      extraHeaderContent={
        isSearchable &&
        !isEmpty && (
          <Searchbar
            name="search"
            inputFieldRef={searchInputRef}
            placeholder={searchPlaceholder ?? t('Search')}
            Icon={SearchIcon}
            onChange={(e) => setSearchInput(e.target.value.toLocaleLowerCase())}
            heightSize="small"
            noMargin
          />
        )
      }
    >
      <OptionSelect title={title} aria-label={title} ref={optionSelectRef}>
        {isEmpty ? (
          <OptionItem selected={false}>{emptyListPlaceholder}</OptionItem>
        ) : emptySearchResults ? (
          <OptionItem selected={false}>{t('No options match the search criteria.')}</OptionItem>
        ) : null}
        {filteredOptions.map((option, index) => {
          const isSelected = option.value === selectedOption?.value
          return (
            <Option
              key={option.value}
              option={option}
              index={index}
              isSelected={isSelected}
              optionRender={optionRender}
              handleOptionSelect={handleOptionSelect}
            />
          )
        })}
        {ListBottomComponent && <div onClick={onClose}>{ListBottomComponent}</div>}
      </OptionSelect>
    </Popup>
  )
}

export default Select

interface OptionProps<T extends OptionValue> {
  option: SelectOption<T>
  index: number
  isSelected: boolean
  handleOptionSelect: (value: T) => void
  optionRender?: (option: SelectOption<T>, isSelected: boolean) => ReactNode
}

const Option = <T extends OptionValue>({
  option,
  index,
  isSelected,
  optionRender,
  handleOptionSelect
}: OptionProps<T>) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <OptionItem
      key={option.value}
      tabIndex={0}
      role="listitem"
      onClick={() => handleOptionSelect(option.value as T)}
      selected={isSelected}
      focusable
      aria-label={option.label}
      hasCustomOptionRender={!!optionRender}
      ref={ref}
    >
      {optionRender ? (
        <CustomOptionContainer isSelected={isSelected}>
          {(index < 20 || isInView) && optionRender(option, isSelected)}
          {isSelected && <CheckMark />}
        </CustomOptionContainer>
      ) : (
        <>
          {option.label}
          {isSelected && <CheckMark />}
        </>
      )}
    </OptionItem>
  )
}

const InputContainer = styled(InputArea)`
  padding: 0;
  outline: none;
`

export const MoreIcon = styled.div`
  position: absolute;
  right: ${inputStyling.paddingLeftRight};
  height: 100%;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.font.secondary};
  z-index: 1;
`

const SelectContainer = styled.div<InputProps>`
  ${({ heightSize, label, contrast }) => inputDefaultStyle(true, false, !!label, heightSize, contrast)};

  padding-right: 35px;
  font-weight: var(--fontWeight-medium);
  gap: 10px;

  cursor: ${({ showPointer }) => showPointer && 'pointer'};

  display: flex;
  align-items: center;
  min-width: 0;

  ${({ simpleMode }) =>
    simpleMode &&
    css`
      border: 0;

      &:not(:hover) {
        background-color: transparent;
      }
    `}
`

export const SelectOutterContainer = styled(InputContainer)<
  Pick<InputProps, 'noMargin' | 'heightSize' | 'simpleMode' | 'showPointer'>
>`
  cursor: ${({ showPointer }) => showPointer && 'pointer'};
  margin: ${({ noMargin, simpleMode }) => (noMargin || simpleMode ? 0 : '10px 0')};
  height: ${({ heightSize }) =>
    heightSize === 'small' ? '38px' : heightSize === 'big' ? '50px' : 'var(--inputHeight)'};

  &:focus {
    ${SelectContainer} {
      box-shadow: 0 0 0 1px ${({ theme }) => theme.global.accent};
      border-color: ${({ theme }) => theme.global.accent};
    }
  }
`

export const OptionSelect = styled.div`
  width: 100%;
  overflow-y: auto;
  border: 0;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 5px;
`

export const OptionItem = styled.button<{
  selected: boolean
  focusable?: boolean
  invisible?: boolean
  isFloating?: boolean
  hasCustomOptionRender?: boolean
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  color: ${({ theme }) => theme.font.primary};
  user-select: none;
  text-align: left;
  visibility: ${({ invisible }) => invisible && 'hidden'};
  font-weight: ${({ selected }) => selected && 'var(--fontWeight-semiBold)'};
  background-color: ${({ theme, selected }) => (selected ? theme.bg.accent : 'transparent')};
  border: 1px solid
    ${({ theme, selected }) => (selected ? colord(theme.global.accent).alpha(0.1).toHex() : 'transparent')};
  font-size: 13px;
  border-radius: var(--radius-small);
  margin: 0 var(--spacing-1);

  ${({ hasCustomOptionRender }) => css`
    padding: ${hasCustomOptionRender ? '0px' : 'var(--spacing-2)'};
  `};

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
  }

  ${({ focusable }) =>
    focusable &&
    css`
      &:focus {
        box-shadow: inset 0 0 0 1px ${({ theme }) => theme.border.primary};
      }
    `}
`

const Searchbar = styled(Input)`
  margin: var(--spacing-1) 0;

  svg {
    color: ${({ theme }) => theme.font.tertiary};
  }
`

const CustomComponentContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const CustomOptionContainer = styled.div<{ isSelected: boolean }>`
  flex: 1;
  display: flex;

  ${CheckMark} {
    height: 100%;
    margin: 12px 8px 12px 4px;
  }

  ${({ isSelected, theme }) =>
    isSelected &&
    css`
      background-color: ${theme.bg.accent};
    `}
`
