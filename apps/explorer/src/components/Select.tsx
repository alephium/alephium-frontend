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

import { motion, MotionStyle, Transition, Variants } from 'framer-motion'
import { ReactNode, useRef, useState } from 'react'
import { RiArrowDownSLine } from 'react-icons/ri'
import styled, { css } from 'styled-components'

import useOnClickOutside from '@/hooks/useOnClickOutside'

interface Dimensions {
  initialItemHeight?: number
  expandedItemHeight?: number
  initialListWidth?: number | string
  expandedListWidth?: number | string
}

type AlignText = 'start' | 'center' | 'end'

interface SelectProps<T extends string> {
  items: SelectListItem<T>[]
  onItemClick: (value: T) => void
  selectedItemValue?: T
  title: string
  dimensions?: Dimensions
  borderRadius?: number
  alignText?: AlignText
  className?: string
  style?: MotionStyle
}

export interface SelectListItem<T extends string> {
  value: T
  label?: string
  LabelComponent?: ReactNode
}

const transition: Transition = { type: 'tween', duration: 0.15 }

const Select = <T extends string>({
  items,
  onItemClick,
  selectedItemValue,
  title,
  dimensions = {
    initialItemHeight: 55,
    expandedItemHeight: 60,
    initialListWidth: '98%',
    expandedListWidth: '100%'
  },
  alignText,
  borderRadius = 12,
  className,
  style
}: SelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false)

  const wrapperRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { initialItemHeight, expandedItemHeight, initialListWidth, expandedListWidth } =
    dimensions as Required<Dimensions>

  const selectedItem = items.find(({ value }) => selectedItemValue === value)

  const handleSelectClick = () => {
    !isOpen && setIsOpen(true)

    // Scroll to top
    listRef.current?.scroll(0, 0)
  }

  const handleClickOutside = () => {
    setIsOpen(false)
  }

  useOnClickOutside({ ref: wrapperRef, handler: handleClickOutside })

  const isItemSelected = (value: T) => selectedItemValue === value

  const handleItemClick = (value: T) => {
    setIsOpen(false)
    onItemClick(value)
  }

  const getSelectItemBaseProps = (listItemProps: SelectListItem<T>) => ({
    value: listItemProps.value,
    label: listItemProps.label,
    LabelComponent: listItemProps.LabelComponent,
    onClick: handleItemClick,
    isDrawerOpen: isOpen,
    initialItemHeight: initialItemHeight,
    expandedItemHeight: expandedItemHeight,
    alignText: alignText,
    borderRadius: borderRadius
  })

  return (
    <SelectWrapper
      role="button"
      className={className}
      onClick={handleSelectClick}
      animate={isOpen ? 'open' : 'initial'}
      style={{ height: initialItemHeight, ...style }}
      ref={wrapperRef}
      variants={{
        open: {
          transform: 'translateY(-5px)'
        }
      }}
    >
      <Divider style={{ top: expandedItemHeight }} />
      <ItemList
        variants={{
          open: {
            height: items.length * expandedItemHeight,
            width: expandedListWidth
          }
        }}
        style={{
          height: initialItemHeight,
          width: initialListWidth,
          borderRadius: borderRadius
        }}
        transition={transition}
        ref={listRef}
      >
        {selectedItem && <SelectItem title={title} {...getSelectItemBaseProps(selectedItem)} />}
        {items.map((item) => (
          <SelectItem key={item.value} isSelected={isItemSelected(item.value)} {...getSelectItemBaseProps(item)} />
        ))}
      </ItemList>
    </SelectWrapper>
  )
}

interface SelectItemProps<T> {
  value: T
  label?: string
  LabelComponent?: ReactNode
  title?: string
  isDrawerOpen: boolean
  isSelected?: boolean
  onClick: (value: T) => void
  initialItemHeight: Required<Dimensions>['initialItemHeight']
  expandedItemHeight: Required<Dimensions>['expandedItemHeight']
  borderRadius: number
  alignText?: AlignText
  className?: string
}

let SelectItem = <T extends string>({
  value,
  label,
  LabelComponent,
  title,
  isSelected = false,
  isDrawerOpen,
  onClick,
  initialItemHeight,
  expandedItemHeight,
  alignText,
  className
}: SelectItemProps<T>) => {
  const itemContainerVariants: Variants = {
    initial: {
      height: initialItemHeight
    },
    open: {
      height: expandedItemHeight,
      transition
    }
  }

  return (
    <motion.div
      key={value}
      onClick={() => !isSelected && onClick(value)}
      className={className}
      variants={itemContainerVariants}
      style={{
        height: initialItemHeight,
        justifyContent: alignText,
        cursor: title && !isDrawerOpen ? 'pointer' : undefined
      }}
    >
      {title && (
        <Title
          style={{
            top: expandedItemHeight / 6,
            fontSize: expandedItemHeight / 5 >= 12 ? 12 : expandedItemHeight / 5
          }}
        >
          {title}
        </Title>
      )}
      <ItemContent
        style={{
          paddingTop: title ? expandedItemHeight / 3.5 : 0,
          opacity: isSelected ? 0.5 : 1
        }}
      >
        {label ? label : LabelComponent ? LabelComponent : null}
      </ItemContent>
      {title && <RiArrowDownSLine strokeWidth={1.5} strokeOpacity={isDrawerOpen ? 0.5 : 1} />}
    </motion.div>
  )
}

export default Select

SelectItem = styled(SelectItem)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: start;
  text-align: center;
  white-space: nowrap;

  width: 100%;

  font-weight: 600;
  font-size: 13px;
  line-height: 14.4px;

  padding: 15px;

  color: ${({ theme }) => theme.font.primary};
  background-color: ${({ theme }) => theme.bg.primary};
  z-index: 1;

  ${({ isSelected }) =>
    !isSelected &&
    css`
      &:hover:not(:first-child) {
        background-color: ${({ theme }) => theme.bg.hover};
        z-index: 0;
        cursor: pointer;
      }
    `}

  &:not(:first-child):not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.border.secondary};
  }

  &:first-child {
    color: ${({ theme }) => theme.font.primary};
    font-weight: 600;
    position: sticky;
    top: 0;
    border-radius: ${({ borderRadius }) => borderRadius}px;
    z-index: 2;
  }

  > span {
    padding-right: 5px;
  }
`

const SelectWrapper = styled(motion.div)`
  position: relative;
  flex: 1;
  height: 60px;
  overflow: hidden;
`

const ItemList = styled(motion.div)`
  margin-right: auto;
  margin-left: auto;
  z-index: 3;
  overflow: auto;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const Divider = styled.div`
  position: absolute;
  height: 1px;
  width: 100%;
  background-color: ${({ theme }) => theme.border.primary};
  z-index: 10;
`

const ItemContent = styled(motion.div)`
  flex: 1;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const Title = styled(motion.span)`
  position: absolute;
  color: ${({ theme }) => theme.font.secondary};
  font-weight: 600;
`
