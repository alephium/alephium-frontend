import { HTMLMotionProps, motion, MotionStyle, Variants } from 'framer-motion'
import styled, { css } from 'styled-components'

import { fadeIn } from '@/animations'
import Box from '@/components/Box'
import { appHeaderHeightPx, deviceBreakPoints } from '@/style/globalStyles'

interface MainPanelProps {
  verticalAlign?: 'center' | 'flex-start'
  horizontalAlign?: 'center' | 'stretch'
  enforceMinHeight?: boolean
  transparentBg?: boolean
  borderless?: boolean
}

type SectionContentAlignment = 'flex-start' | 'center' | 'stretch'

interface SectionProps extends HTMLMotionProps<'div'> {
  apparitionDelay?: number
  style?: MotionStyle
  inList?: boolean
  align?: SectionContentAlignment
}

const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  shown: (apparitionDelay = 0) => ({
    opacity: 1,
    transition: {
      duration: 0.1,
      when: 'beforeChildren',
      delay: apparitionDelay,
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }),
  out: {
    opacity: 0
  }
}

export const sectionChildrenVariants: Variants = {
  shown: (disabled) => ({ y: 0, opacity: disabled ? 0.5 : 1 }),
  disabled: { y: 0, opacity: 0.5 }
}

export const FloatingPanel: FC<MainPanelProps> = ({ children, ...props }) => (
  <StyledFloatingPanel {...fadeIn} {...props}>
    {children}
  </StyledFloatingPanel>
)

export const Section = ({ children, apparitionDelay, inList, align = 'center', style, className }: SectionProps) => (
  <SectionContainer
    variants={sectionVariants}
    initial="hidden"
    animate="shown"
    exit="hidden"
    custom={apparitionDelay}
    inList={inList}
    align={align}
    style={style}
    className={className}
  >
    {children}
  </SectionContainer>
)

export const BoxContainer = ({ children, ...props }: HTMLMotionProps<'div'>) => (
  <StyledBoxContainer variants={sectionChildrenVariants} {...props}>
    {children}
  </StyledBoxContainer>
)

const StyledFloatingPanel = styled(motion.div)<MainPanelProps>`
  width: 100%;
  margin: ${appHeaderHeightPx}px auto;
  max-width: 600px;
  min-height: ${({ enforceMinHeight }) => (enforceMinHeight ? '600px' : 'initial')};
  padding: var(--spacing-5);
  display: flex;
  flex-direction: column;
  justify-content: ${({ verticalAlign }) => verticalAlign || 'flex-start'};
  align-items: ${({ horizontalAlign }) => horizontalAlign || 'stretch'};
  border-radius: var(--radius-huge);

  ${({ borderless, theme }) => !borderless && css``}

  @media ${deviceBreakPoints.mobile} {
    box-shadow: none;
    max-width: initial;
  }

  @media ${deviceBreakPoints.short} {
    box-shadow: none;
  }
`

export const PanelContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`

export const SectionContainer = styled(motion.div)<{ align: SectionContentAlignment; inList?: boolean }>`
  display: flex;
  align-items: ${({ align }) => align};
  flex-direction: column;
  min-width: 280px;

  margin-top: ${({ inList }) => (inList ? 'var(--spacing-5)' : '0')};
`

const StyledBoxContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const FooterActionsContainer = styled(Section)`
  flex: 0;
  margin-top: var(--spacing-5);
  width: 100%;
`

export const PageTitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);
`

export const CenteredSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
  height: 100%;
  background-color: ${({ theme }) => theme.bg.background1};
`
