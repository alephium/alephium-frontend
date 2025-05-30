import { motion } from 'framer-motion'
import styled from 'styled-components'

const Card = styled(motion.div)<{ isPlaceholder?: boolean }>`
  width: 230px;
  border: 1px ${({ isPlaceholder }) => (isPlaceholder ? 'dashed' : 'solid')} ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  background-color: ${({ theme, isPlaceholder }) => (isPlaceholder ? theme.bg.background1 : theme.bg.tertiary)};
  overflow: hidden;
`

export default Card
