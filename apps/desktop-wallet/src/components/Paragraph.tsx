import { ReactNode } from 'react'
import styled, { css } from 'styled-components'

interface ParagraphProps {
  centered?: boolean
  secondary?: boolean
  className?: string
  children?: ReactNode
}

const Paragraph = ({ centered, secondary, children, className }: ParagraphProps) => (
  <StyledParagraph className={className} centered={centered} secondary={secondary}>
    {children}
  </StyledParagraph>
)

export default Paragraph

const StyledParagraph = styled.p<ParagraphProps>`
  font-size: 15px;
  white-space: pre-wrap;
  font-weight: var(--fontWeight-medium);
  width: 100%;
  line-height: 1.5em;
  max-width: 400px;
  margin: 8px 0;

  ${({ centered }) =>
    centered &&
    css`
      text-align: center;
      align-self: center;
    `}

  ${({ secondary, theme }) =>
    secondary &&
    css`
      color: ${theme.font.secondary};
    `}
`
