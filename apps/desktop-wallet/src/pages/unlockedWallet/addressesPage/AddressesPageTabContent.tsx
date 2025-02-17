import { motion } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeInOut } from '@/animations'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'

interface AddressesPageTabContentProps {
  searchPlaceholder: string
  onSearch: (str: string) => void
  buttonText: string
  onButtonClick: () => void
  children: ReactNode
  HeaderMiddleComponent?: ReactNode
  className?: string
}

const AddressesPageTabContent = ({
  searchPlaceholder,
  onSearch,
  buttonText,
  onButtonClick,
  HeaderMiddleComponent,
  children,
  className
}: AddressesPageTabContentProps) => (
  <AddressesPageTabContentStyled className={className}>
    <Header>
      <Searchbar
        placeholder={searchPlaceholder}
        Icon={SearchIcon}
        onChange={(e) => onSearch(e.target.value)}
        contrast
        heightSize="normal"
      />
      {HeaderMiddleComponent}
      <ButtonContainer {...fadeInOut}>
        <HeaderButton wide onClick={onButtonClick} short>
          {buttonText}
        </HeaderButton>
      </ButtonContainer>
    </Header>
    <Content>{children}</Content>
  </AddressesPageTabContentStyled>
)

export default AddressesPageTabContent

const AddressesPageTabContentStyled = styled.div`
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
