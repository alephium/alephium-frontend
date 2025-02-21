import { motion } from 'framer-motion'
import { SearchIcon } from 'lucide-react'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { fadeInOut } from '@/animations'
import Button from '@/components/Button'
import Input from '@/components/Inputs/Input'
import { useUnsortedAddressesHashes } from '@/hooks/useUnsortedAddresses'

interface AddressesPageTabContentProps {
  searchPlaceholder: string
  onSearch: (str: string) => void
  buttonText: string
  onButtonClick: () => void
  children: ReactNode
  HeaderMiddleComponent?: ReactNode
  AdditionalButtonComponents?: ReactNode
  className?: string
}

const AddressesPageTabContent = ({
  searchPlaceholder,
  onSearch,
  buttonText,
  onButtonClick,
  HeaderMiddleComponent,
  AdditionalButtonComponents,
  children,
  className
}: AddressesPageTabContentProps) => {
  const hasMultipleAddresses = useUnsortedAddressesHashes().length > 1

  return (
    <AddressesPageTabContentStyled className={className}>
      <Header>
        {hasMultipleAddresses && (
          <LeftSide>
            <Searchbar
              placeholder={searchPlaceholder}
              Icon={SearchIcon}
              onChange={(e) => onSearch(e.target.value)}
              contrast
              heightSize="normal"
            />
            {HeaderMiddleComponent}
          </LeftSide>
        )}
        <ButtonContainer {...fadeInOut}>
          {AdditionalButtonComponents}
          <Button onClick={onButtonClick} short>
            {buttonText}
          </Button>
        </ButtonContainer>
      </Header>
      <Content>{children}</Content>
    </AddressesPageTabContentStyled>
  )
}

export default AddressesPageTabContent

const AddressesPageTabContentStyled = styled.div`
  position: absolute;
  width: 100%;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
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
`

const ButtonContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  margin-left: auto;
`

const LeftSide = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  flex-grow: 1;
`
