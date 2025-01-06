import { motion } from 'framer-motion'
import styled from 'styled-components'

const Box = styled(motion.div)`
  background-color: ${({ theme }) => theme.bg.primary};
  border: 1px solid ${({ theme }) => theme.border.primary};
  border-radius: var(--radius-big);
  width: 100%;
`

export default Box
