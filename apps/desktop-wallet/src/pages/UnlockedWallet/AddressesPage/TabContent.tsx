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

import { motion } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeInOut } from '@/animations'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'

interface TabContentProps {
  searchPlaceholder: string
  onSearch: (str: string) => void
  buttonText: string
  onButtonClick: () => void
  HeaderMiddleComponent?: ReactNode
  className?: string
}

const TabContent: FC<TabContentProps> = ({
  searchPlaceholder,
  onSearch,
  buttonText,
  onButtonClick,
  HeaderMiddleComponent,
  children,
  className
}) => (
  <TabContentStyled className={className}>
    <Header>
      <Searchbar
        placeholder={searchPlaceholder}
        Icon={SearchIcon}
        onChange={(e) => onSearch(e.target.value)}
        contrast
      />
      {HeaderMiddleComponent}
      <ButtonContainer {...fadeInOut}>
        <HeaderButton wide onClick={onButtonClick} short>
          {buttonText}
        </HeaderButton>
      </ButtonContainer>
    </Header>
    <Content>{children}</Content>
  </TabContentStyled>
)

export default TabContent

const TabContentStyled = styled.div`
  position: absolute;
  width: 100%;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  margin: var(--spacing-2) 0;
  gap: 25px;
`

const Searchbar = styled(Input)`
  max-width: 364px;
  margin: 0;

  svg {
    color: ${({ theme }) => theme.font.tertiary};
  }
`

const Content = styled.div`
  display: flex;
  padding: var(--spacing-4) 0;
`

const HeaderButton = styled(Button)``

const ButtonContainer = styled(motion.div)`
  margin-left: auto;
`
