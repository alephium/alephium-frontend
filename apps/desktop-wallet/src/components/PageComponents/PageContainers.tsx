import { HTMLProps, ReactNode } from 'react'
import styled from 'styled-components'

import Box from '@/components/Box'
import { appHeaderHeightPx, deviceBreakPoints } from '@/style/globalStyles'

interface MainPanelProps extends HTMLProps<'div'> {
  verticalAlign?: 'center' | 'flex-start'
  horizontalAlign?: 'center' | 'stretch'
  enforceMinHeight?: boolean
  transparentBg?: boolean
  noMargin?: boolean
  children?: ReactNode
}

type SectionContentAlignment = 'flex-start' | 'center' | 'stretch'

interface SectionProps extends HTMLProps<'div'> {
  apparitionDelay?: number
  inList?: boolean
  align?: SectionContentAlignment
}

export const FloatingPanel = ({ children, ...props }: MainPanelProps) => (
  <FloatingPanelStyled {...props}>{children}</FloatingPanelStyled>
)

export const Section = ({ children, inList, align = 'center', className }: SectionProps) => (
  <SectionContainer inList={inList} align={align} className={className}>
    {children}
  </SectionContainer>
)

export const BoxContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
`
const FloatingPanelStyled = styled.div<MainPanelProps>`
  width: 100%;
  margin: ${({ noMargin }) => (noMargin ? 0 : `${appHeaderHeightPx}px auto`)};
  max-width: 500px;
  min-height: ${({ enforceMinHeight }) => (enforceMinHeight ? '600px' : 'initial')};
  padding: var(--spacing-7) var(--spacing-6);
  display: flex;
  flex-direction: column;
  justify-content: ${({ verticalAlign }) => verticalAlign || 'flex-start'};
  align-items: ${({ horizontalAlign }) => horizontalAlign || 'stretch'};
  z-index: 1;

  @media ${deviceBreakPoints.mobile} {
    max-width: initial;
  }
`

export const PanelContentContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const SectionContainer = styled.div<{ align: SectionContentAlignment; inList?: boolean }>`
  display: flex;
  align-items: ${({ align }) => align};
  flex-direction: column;
  min-width: 280px;

  margin-top: ${({ inList }) => (inList ? 'var(--spacing-3)' : '0')};
`

export const FooterActionsContainer = styled(Section)`
  flex: 0;
  margin-top: var(--spacing-2);
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
  background-color: ${({ theme }) => theme.bg.background2};
`
