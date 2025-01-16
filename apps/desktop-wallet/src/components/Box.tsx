import { motion } from 'framer-motion'
import styled from 'styled-components'

const Box = styled(motion.div)<{ secondary?: boolean }>`
  border: 1px solid ${({ theme }) => theme.border.secondary};
  border-radius: var(--radius-huge);
  width: 100%;
`

export default Box
