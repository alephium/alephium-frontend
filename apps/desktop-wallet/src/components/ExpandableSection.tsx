import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { fastTransition } from '@/animations'
import InputArea from '@/components/Inputs/InputArea'
import { Section } from '@/components/PageComponents/PageContainers'
import { onEnterOrSpace } from '@/utils/misc'

interface ExpandableSectionProps {
  sectionTitleClosed: string
  sectionTitleOpen?: string
  open?: boolean
  onOpenChange?: (isOpen: boolean) => void
  centered?: boolean
  shrinkWhenOpen?: boolean
  isCheckbox?: boolean
  className?: string
}

const ExpandableSection: FC<ExpandableSectionProps> = ({
  sectionTitleClosed,
  sectionTitleOpen,
  open = false,
  onOpenChange,
  children,
  centered,
  shrinkWhenOpen = false,
  isCheckbox = false,
  className
}) => {
  const [isExpanded, setIsExpanded] = useState(open)
  const [isVisible, setIsVisible] = useState(open)

  useEffect(() => {
    if (open) {
      setIsVisible(open)
      setIsExpanded(open)
    } else {
      setIsExpanded(open)
    }
  }, [open])

  const handleTitleExpansion = () => {
    const newState = !isExpanded
    onOpenChange && onOpenChange(newState)
    if (newState) {
      setIsVisible(newState)
    }
    setIsExpanded(newState)
  }

  const titleText = isExpanded && sectionTitleOpen ? sectionTitleOpen : sectionTitleClosed

  return (
    <ExpandableSectionContainer className={className} shrinkWhenOpen={shrinkWhenOpen} isOpen={isExpanded}>
      <Title
        onMouseDown={handleTitleExpansion}
        onKeyDown={(e) => onEnterOrSpace(e, handleTitleExpansion)}
        aria-expanded={isExpanded}
      >
        {centered && <LeftDivider />}
        {isCheckbox ? (
          <input type="checkbox" tabIndex={-1} checked={isExpanded} onChange={() => setIsExpanded(!isExpanded)} />
        ) : (
          <Chevron animate={{ rotate: isExpanded ? 180 : 0 }} />
        )}

        <TitleText>{titleText}</TitleText>
        <Divider />
      </Title>
      {isVisible && (
        <ContentWrapper
          onAnimationComplete={() => setIsVisible(isExpanded)}
          animate={{ height: isExpanded ? 'auto' : 0 }}
          {...fastTransition}
        >
          <Content>
            <Section align="stretch">{children}</Section>
          </Content>
        </ContentWrapper>
      )}
    </ExpandableSectionContainer>
  )
}

export default ExpandableSection

const ExpandableSectionContainer = styled.div<{ shrinkWhenOpen: boolean; isOpen?: boolean }>`
  display: flex;
  flex-direction: column;
  margin: var(--spacing-2) 0;
  transition: margin 0.2s ease-in-out;

  ${({ shrinkWhenOpen, isOpen }) =>
    shrinkWhenOpen &&
    isOpen &&
    css`
      margin-bottom: 0;
    `}
`

const Title = styled(InputArea)`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.global.accent};
`

const Chevron = styled(motion(ChevronDown))`
  width: 16px;
  height: 100%;
`

const TitleText = styled.span`
  margin-left: 6px;
  margin-right: 6px;
`

const Divider = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.border.secondary};
  flex: 1;
`

const LeftDivider = styled(Divider)`
  margin-right: 6px;
`

const ContentWrapper = styled(motion.div)`
  overflow: hidden;
  height: 0;
`

const Content = styled.div`
  margin-top: var(--spacing-2);
`
