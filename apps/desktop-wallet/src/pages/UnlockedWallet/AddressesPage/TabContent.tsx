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
        heightSize="small"
      />
      {HeaderMiddleComponent}
      <ButtonContainer {...fadeInOut}>
        <HeaderButton short onClick={onButtonClick}>
          {buttonText}
        </HeaderButton>
      </ButtonContainer>
    </Header>
    <Cards>{children}</Cards>
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

const Cards = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 25px;
  padding-top: var(--spacing-4);
  padding-bottom: 60px;
`

const HeaderButton = styled(Button)`
  margin: 0;
  margin-left: auto;
  height: 40px;
`

const ButtonContainer = styled(motion.div)`
  margin-left: auto;
`
