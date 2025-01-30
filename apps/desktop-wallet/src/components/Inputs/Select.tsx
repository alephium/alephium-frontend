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
import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'
import Popup from '@/components/Popup'
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
  const selectedValueRef = useRef<HTMLDivElement>(null)

  const [canBeAnimated, setCanBeAnimated] = useState(false)
  const [value, setValue] = useState(controlledValue)
  const [showPopup, setShowPopup] = useState(false)
  const [hookCoordinates, setHookCoordinates] = useState<Coordinates | undefined>(undefined)

  const multipleAvailableOptions = options.length > 1

  const getContainerCenter = (): Coordinates | undefined => {
    if (selectedValueRef?.current) {
      const containerElement = selectedValueRef.current
      const containerElementRect = containerElement.getBoundingClientRect()

      return {
        x: containerElementRect.x + containerElement.clientWidth / 2,
        y: containerElementRect.y + containerElement.clientHeight / 2
      }
    }
  }

  const setInputValue = useCallback(
    (option: SelectOption<T>) => {
      if (!value || !isEqual(option, value) || skipEqualityCheck) {
        onSelect(option.value)
        setValue(option)

        selectedValueRef.current?.focus()
      }
    },
    [onSelect, skipEqualityCheck, value]
  )

  const handleClick = () => {
    if (!multipleAvailableOptions) {
      allowReselectionOnClickWhenSingleOption && options.length === 1 && onSelect(options[0].value)

      return
    }

    setHookCoordinates(getContainerCenter())
    setShowPopup(true)
  }

  const handleKeyDown = (e: ReactKeyboardEvent) => {
    if (![' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) return
    if (!multipleAvailableOptions) return
    setHookCoordinates(getContainerCenter())
    setShowPopup(true)
  }

  const handlePopupClose = () => {
    setShowPopup(false)
    selectedValueRef.current?.focus()
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
        variants={sectionChildrenVariants}
        animate={canBeAnimated ? (!disabled ? 'shown' : 'disabled') : false}
        onAnimationComplete={() => setCanBeAnimated(true)}
        custom={disabled}
        noMargin={noMargin}
        onMouseDown={handleClick}
        onKeyDown={handleKeyDown}
        style={{ zIndex: raised && showPopup ? 2 : undefined, boxShadow: disabled ? 'none' : undefined }}
        heightSize={heightSize}
        simpleMode={simpleMode}
        tabIndex={renderCustomComponent ? -1 : 0}
        showPointer={multipleAvailableOptions}
      >
        {renderCustomComponent ? (
          <CustomComponentContainer ref={selectedValueRef}>
            {renderCustomComponent(value, !multipleAvailableOptions)}
          </CustomComponentContainer>
        ) : (
          <>
            {multipleAvailableOptions && !simpleMode && <SelectMoreIcon />}
            <SelectContainer
              tabIndex={-1}
              className={className}
              ref={selectedValueRef}
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
        {showPopup && (
          <SelectOptionsModal
            options={options}
            optionRender={optionRender}
            selectedOption={value}
            setValue={setInputValue}
            title={title}
            hookCoordinates={hookCoordinates}
            onClose={handlePopupClose}
            parentSelectRef={selectedValueRef}
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
  floatingOptions?: boolean
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
  floatingOptions,
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
        {filteredOptions.map((option) => {
          const isSelected = option.value === selectedOption?.value
          return (
            <OptionItem
              key={option.value}
              tabIndex={0}
              role="listitem"
              onClick={() => handleOptionSelect(option.value as T)}
              selected={isSelected}
              focusable
              aria-label={option.label}
              isFloating={floatingOptions}
              hasCustomOptionRender={!!optionRender}
            >
              {optionRender ? (
                optionRender(option, isSelected)
              ) : (
                <>
                  {option.label}
                  {isSelected && <CheckMark />}
                </>
              )}
            </OptionItem>
          )
        })}
        {ListBottomComponent && <div onClick={onClose}>{ListBottomComponent}</div>}
      </OptionSelect>
    </Popup>
  )
}

export default Select

const InputContainer = styled(InputArea)`
  margin: 10px 0;
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
    heightSize === 'small' ? '38px' : heightSize === 'big' ? '60px' : 'var(--inputHeight)'};

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
  color: ${({ theme, selected }) => (selected ? theme.font.accent : theme.font.primary)};
  user-select: none;
  text-align: left;
  visibility: ${({ invisible }) => invisible && 'hidden'};
  font-weight: ${({ selected }) => selected && 'var(--fontWeight-semiBold)'};
  font-size: 13px;

  ${({ hasCustomOptionRender }) => css`
    padding: ${hasCustomOptionRender ? '0px' : 'var(--spacing-3) 0'};
    margin: ${hasCustomOptionRender ? '0px' : '0 var(--spacing-4)'};
  `};

  ${({ isFloating }) =>
    isFloating
      ? css`
          margin: var(--spacing-2) var(--spacing-4);
          border-radius: var(--radius-medium);
          overflow: hidden;
        `
      : css`
          &:not(:last-child) {
            border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
          }
        `}

  ${({ focusable }) =>
    focusable &&
    css`
      &:focus {
        background-color: ${({ theme }) => theme.bg.accent};
      }

      &:hover {
        background-color: ${({ theme }) => theme.bg.hover};
      }
    `}
`

const Searchbar = styled(Input)`
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
