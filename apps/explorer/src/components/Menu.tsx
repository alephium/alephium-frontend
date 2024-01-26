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

import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { RiMore2Line } from 'react-icons/ri'
import styled from 'styled-components'

interface MenuItem {
  text: string
  icon?: React.ReactNode
  onClick: () => void
}

type Direction = 'up' | 'down'

const menuHeight = '45px'

const Menu = ({
  label,
  icon,
  items,
  direction,
  className
}: {
  label: string
  icon?: React.ReactNode
  items: MenuItem[]
  direction: Direction
  className?: string
}) => {
  const [visible, setVisible] = useState(false)

  const animationOrigin = direction === 'up' ? '-95%' : `calc(${menuHeight} - 10px)`
  const animationDestination = direction === 'up' ? '-100%' : menuHeight

  const handleBlur = () => {
    setVisible(false)
  }

  return (
    <MenuContainer
      onClick={() => setVisible(!visible)}
      className={className}
      id="menu-container"
      onBlur={handleBlur}
      tabIndex={0}
    >
      <MenuCurrentContent>
        {icon && <IconContainer>{icon}</IconContainer>}
        <Label>{label}</Label>
        <RiMore2Line size={15} />
      </MenuCurrentContent>
      <AnimatePresence>
        {visible && (
          <MenuItemsContainer
            initial={{ y: animationOrigin, opacity: 0 }}
            animate={{ y: animationDestination, opacity: 1 }}
            exit={{ y: animationOrigin, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <MenuItemsList
              style={{ marginBottom: direction === 'up' ? '8px' : 0, marginTop: direction === 'down' ? '8px' : 0 }}
            >
              {items.map((item, i) => (
                <div key={i}>
                  <MenuItem onClick={item.onClick}>
                    {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                    <ItemText>{item.text}</ItemText>
                  </MenuItem>
                  {i !== items.length - 1 && <Divider />}
                </div>
              ))}
            </MenuItemsList>
          </MenuItemsContainer>
        )}
      </AnimatePresence>
    </MenuContainer>
  )
}

export default Menu

const MenuContainer = styled.div`
  position: relative;
  height: ${menuHeight};
  display: flex;
  outline: none;

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
  }
`

const MenuCurrentContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  gap: 15px;
`

const Label = styled.span`
  color: ${({ theme }) => theme.font.primary};
  line-height: initial;
  flex: 1;
`

const IconContainer = styled.div``

const MenuItemsContainer = styled(motion.div)`
  position: absolute;
  width: 100%;
  z-index: 10000;
`

const MenuItemsList = styled.div`
  overflow: hidden;
  border-radius: 9px;
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
`

const ItemIcon = styled.div`
  width: 23px;
  height: 23px;

  margin-right: 20px;
  opacity: 0.8;
`

const MenuItem = styled.div`
  height: 47px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  cursor: pointer;
  color: ${({ theme }) => theme.font.primary};

  &:hover {
    background-color: ${({ theme }) => theme.bg.hover};
    color: ${({ theme }) => theme.global.accent};

    ${ItemIcon} {
      opacity: 1;
    }
  }
`

const ItemText = styled.div``

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
`
