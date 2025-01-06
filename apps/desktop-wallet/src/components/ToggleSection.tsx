import { colord } from 'colord'
import { motion } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'
import styled, { useTheme } from 'styled-components'

import { fastTransition } from '@/animations'
import Toggle from '@/components/Inputs/Toggle'

export interface ToggleSectionProps {
  title: string
  children: ReactNode
  subtitle?: string
  isOpen?: boolean
  onClick?: (b: boolean) => void
  shadow?: boolean
  className?: string
}

const ToggleSection = ({
  title,
  subtitle,
  isOpen,
  onClick = () => null,
  shadow,
  children,
  className
}: ToggleSectionProps) => {
  const [isShown, setIsShown] = useState(isOpen || false)
  const theme = useTheme()

  const handleToggle = () => {
    onClick(!isShown)
    setIsShown(!isShown)
  }

  useEffect(() => {
    if (isOpen !== undefined) setIsShown(isOpen)
  }, [isOpen])

  return (
    <div className={className} style={{ boxShadow: shadow && isShown ? theme.shadow.tertiary : undefined }}>
      <Header>
        <TitleColumn>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </TitleColumn>
        <Toggle onToggle={handleToggle} label={title} toggled={isShown} />
      </Header>
      <Content
        animate={{
          height: isShown ? 'auto' : 0,
          opacity: isShown ? 1 : 0,
          visibility: isShown ? 'visible' : 'hidden'
        }}
        {...fastTransition}
      >
        <Children>{children}</Children>
      </Content>
    </div>
  )
}

export default styled(ToggleSection)`
  display: flex;
  flex-direction: column;
  border: 1px solid ${({ theme }) => theme.border.primary};
  background-color: ${({ theme }) => colord(theme.bg.background2).alpha(0.5).toHex()};
  border-radius: var(--radius-big);
  padding-bottom: 16px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  padding-bottom: 0px;
`

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`

const Title = styled.div`
  font-weight: var(--fontWeight-semiBold);
`

const Subtitle = styled.div`
  color: ${({ theme }) => theme.font.tertiary};
  text-align: left;
`

const Content = styled(motion.div)`
  overflow: hidden;
  height: 0;
  opacity: 0;
  visibility: hidden;
`

const Children = styled.div`
  display: flex;
  flex-direction: column;
  border-top: 1px solid ${({ theme }) => theme.border.primary};
  margin-top: 16px;
  padding: 16px 21px 0 21px;
`
