import { HTMLMotionProps, motion } from 'framer-motion'
import styled, { css } from 'styled-components'

import { sectionChildrenVariants } from '@/components/PageComponents/PageContainers'

interface ParagraphProps {
  centered?: boolean
  secondary?: boolean
}

const Paragraph: FC<HTMLMotionProps<'p'> & ParagraphProps> = ({
  centered,
  secondary,
  children,
  className,
  style,
  ...props
}) => (
  <StyledParagraph
    variants={sectionChildrenVariants}
    className={className}
    centered={centered}
    secondary={secondary}
    style={style}
    {...props}
  >
    {children}
  </StyledParagraph>
)

export default Paragraph

const StyledParagraph = styled(motion.p)<ParagraphProps>`
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
